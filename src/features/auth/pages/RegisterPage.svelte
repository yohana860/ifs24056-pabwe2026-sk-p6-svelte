<script>
  import useInput from "../../../hooks/useInput";
  import {
    default as apiHelper,
  } from "../../../helpers/apiHelper";
  import {
    showErrorDialog,
    showSuccessDialog,
  } from "../../../helpers/toolsHelper";
  import { navigate } from "../../../router";

  const { input: name, handleChange: handleName } = useInput("");
  const { input: email, handleChange: handleEmail } = useInput("");
  const { input: password, handleChange: handlePassword } = useInput("");
  const { input: confirmPassword, handleChange: handleConfirmPassword } =
    useInput("");

  let loading = $state(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if ($password !== $confirmPassword) {
      await showErrorDialog("Konfirmasi password tidak cocok");
      return;
    }
    loading = true;
    try {
      const res = await apiHelper.post("/auth/register", {
        name: $name,
        email: $email,
        password: $password,
      });

      if (res.status === "success") {
        await showSuccessDialog("Registrasi berhasil. Silakan login.");
        navigate("/auth/login");
      } else {
        await showErrorDialog(res.message || "Registrasi gagal");
      }
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
      for="register-name-input"
      class="block text-sm font-medium text-slate-700 mb-1"
    >
      Nama Lengkap
    </label>
    <input
      id="register-name-input"
      data-testid="register-name-input"
      type="text"
      required
      value={$name}
      oninput={handleName}
      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Nama lengkap"
    />
  </div>

  <div>
    <label
      for="register-email-input"
      class="block text-sm font-medium text-slate-700 mb-1"
    >
      Email
    </label>
    <input
      id="register-email-input"
      data-testid="register-email-input"
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
      for="register-password-input"
      class="block text-sm font-medium text-slate-700 mb-1"
    >
      Password
    </label>
    <input
      id="register-password-input"
      data-testid="register-password-input"
      type="password"
      required
      minlength="6"
      value={$password}
      oninput={handlePassword}
      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Minimal 6 karakter"
    />
  </div>

  <div>
    <label
      for="register-confirm-password-input"
      class="block text-sm font-medium text-slate-700 mb-1"
    >
      Konfirmasi Password
    </label>
    <input
      id="register-confirm-password-input"
      data-testid="register-confirm-password-input"
      type="password"
      required
      value={$confirmPassword}
      oninput={handleConfirmPassword}
      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Ulangi password"
    />
  </div>

  <button
    id="register-submit-button"
    data-testid="register-submit-button"
    type="submit"
    disabled={loading}
    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
  >
    {loading ? "Memproses..." : "Daftar"}
  </button>

  <p class="text-center text-sm text-slate-500">
    Sudah punya akun?
    <button
      type="button"
      onclick={() => navigate("/auth/login")}
      class="text-blue-600 font-semibold hover:underline"
    >
      Masuk
    </button>
  </p>
</form>