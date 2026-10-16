const apiHelper = (() => {
  const BASE_URL =
    typeof DELCOM_BASEURL !== "undefined"
      ? DELCOM_BASEURL
      : "https://open-api.delcom.org/api/v1";

  function getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  function putAccessToken(token) {
    if (!token) {
      localStorage.removeItem("accessToken");
    } else {
      localStorage.setItem("accessToken", token);
    }
  }

  async function fetchData(url, options = {}) {
    // Kalau URL relative (tidak diawali http), prepend BASE_URL
    const fullPath = /^https?:\/\//.test(url) ? url : `${BASE_URL}${url}`;

    const urlQuery = fullPath.includes("?") ? fullPath.split("?")[1] : "";
    const urlWithoutQuery = fullPath.replace(`?${urlQuery}`, "");
    const fixUrl = urlWithoutQuery.endsWith("/")
      ? urlWithoutQuery.slice(0, -1)
      : urlWithoutQuery;
    const finalUrl = fixUrl + (urlQuery ? `?${urlQuery}` : "");

    const token = getAccessToken();
    const headers = { ...(options.headers || {}) };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(finalUrl, {
      ...options,
      mode: "cors",
      headers,
    });
  }

  // Helper request yang return JSON
  async function request(path, { method = "GET", body, headers = {} } = {}) {
    const opts = { method, headers: { ...headers } };

    if (body instanceof FormData) {
      opts.body = body;
    } else if (body !== undefined && body !== null) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }

    const response = await fetchData(path, opts);
    const data = await response.json();
    return data;
  }

  return {
    fetchData,
    putAccessToken,
    getAccessToken,
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    delete: (path) => request(path, { method: "DELETE" }),
    postMultipart: (path, formData) =>
      request(path, { method: "POST", body: formData }),
    putMultipart: (path, formData) =>
      request(path, { method: "PUT", body: formData }),
  };
})();

export default apiHelper;