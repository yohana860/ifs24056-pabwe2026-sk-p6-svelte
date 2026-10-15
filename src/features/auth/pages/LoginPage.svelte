<script>
  import useInput from "../../../hooks/useInput";
  import { authStore } from "../states/authStore";
  import {
    putAccessToken,
    default as apiHelper,
  } from "../../../helpers/apiHelper";
  import {
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";
  import { navigate } from "../../../router";

  const { input: email, handleChange: handleEmail } = useInput("");
  const { input: password, handleChange: handlePassword } = useInput("");

  let loading = $state(false);

  async function handleSubmit(event) {
    event.preventDefault();
    loading = true;
    try {
      const res = await apiHelper.post("/auth/login", {
        email: $email,
        password: $password,
      });

      if (res.status !== "success") {
        await showErrorDialog(res.message || "Login gagal");
        return;
      }

      const d = res.data || {};
      const token =
        d.accessToken ||
        d.token ||
        d.access_token ||
        (d.data && (d.data.accessToken || d.data.token));

      if (!token) {
        await showErrorDialog("Token tidak ditemukan di response");
        return;
      }

      putAccessToken(token);
      authStore.setAuth({ email: $email }, token);

      await showSuccessDialog("Login berhasil");
      navigate("/");
    } catch (err) {
      await showErrorDialog(err.message || "Terjadi kesalahan");
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label
      for="login-email-input"
      class="block text-sm font-medium text-slate-700 mb-1"
    >
      Email
    </label>
    <input
      id="login-email-input"
      data-testid="login-email-input"
      name="username"
      type="email"
      required
      value={$email}
      oninput={handleEmail}
      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="kamu@email.com"
    />
  </div>

  <div>
    <label
      for="login-password-input"
      class="block text-sm font-medium text-slate-700 mb-1"
    >
      Password
    </label>
    <input
      id="login-password-input"
      data-testid="login-password-input"
      name="password"
      type="password"
      required
      value={$password}
      oninput={handlePassword}
      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="••••••••"
    />
  </div>

  <button
    id="login-submit-button"
    data-testid="login-submit-button"
    type="submit"
    disabled={loading}
    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
  >
    {loading ? "Memproses..." : "Masuk"}
  </button>

  <p class="text-center text-sm text-slate-500">
    Belum punya akun?
    <button
      type="button"
      onclick={() => navigate("/auth/register")}
      class="text-blue-600 font-semibold hover:underline"
    >
      Daftar
    </button>
  </p>
</form>