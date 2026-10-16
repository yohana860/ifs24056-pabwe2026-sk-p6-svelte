<script>
  import { navigate } from "../../../router";
</script>

<main class="min-h-[60vh] flex flex-col items-center justify-center p-6">
  <h1 class="text-6xl font-bold text-blue-600">404</h1>
  <p class="text-slate-600 mt-3 mb-6">Halaman tidak ditemukan.</p>
  <button
    onclick={() => navigate("/")}
    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg"
  >
    Kembali ke Beranda
  </button>
</main>