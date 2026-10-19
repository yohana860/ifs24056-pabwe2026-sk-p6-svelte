<script>
  let { children } = $props();
</script>

<main
  class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-6"
>
  <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
    <header class="text-center mb-6">
      <h1 class="text-3xl font-bold text-blue-600">Delcom Link Tree</h1>
      <p class="text-sm text-slate-600 mt-1">
        Kumpulkan dan bagikan semua tautan pentingmu dalam satu halaman
      </p>
    </header>
    {@render children?.()}
  </div>
</main>