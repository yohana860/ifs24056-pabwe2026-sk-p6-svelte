// Prioritas:
// 1. Nilai dari vite.config.js (define.DELCOM_BASEURL)
// 2. Fallback ke open-api production (bukan localhost)
const BASE_URL =
  typeof DELCOM_BASEURL !== "undefined" && DELCOM_BASEURL
    ? DELCOM_BASEURL
    : "https://open-api.delcom.org/api/v1";

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function putAccessToken(token) {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = getAccessToken();
  const options = {
    method,
    headers: { ...headers },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined && body !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  return data;
}

const apiHelper = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  postMultipart: (path, formData) =>
    request(path, { method: "POST", body: formData }),
  putMultipart: (path, formData) =>
    request(path, { method: "PUT", body: formData }),
};

export default apiHelper;