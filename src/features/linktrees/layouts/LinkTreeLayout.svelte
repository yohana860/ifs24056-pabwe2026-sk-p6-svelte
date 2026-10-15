<script>
  import { onMount } from "svelte";
  import NavbarComponent from "../components/NavbarComponent.svelte";
  import SidebarComponent from "../components/SidebarComponent.svelte";
  import { navigate } from "../../../router.js";
  import { authStore } from "../../auth/states/authStore";
  import {
    getAccessToken,
    default as apiHelper,
  } from "../../../helpers/apiHelper";

  let { children } = $props();

  let isSidebarOpen = $state(false);
  let profile = $state(null);

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function closeSidebar() {
    isSidebarOpen = false;
  }

  function handleLogout() {
    authStore.clearAuth();
    navigate("/auth/login");
  }

  onMount(async () => {
    if (!getAccessToken()) return;
    try {
      const res = await apiHelper.get("/users/me");
      if (res.status === "success") {
        profile = res.data.user;
      }
    } catch {
      /* silent */
    }
  });
</script>

<div class="min-h-screen flex flex-col bg-slate-50">
  <NavbarComponent
    {profile}
    {isSidebarOpen}
    onToggleSidebar={toggleSidebar}
    onLogout={handleLogout}
  />

  <div class="flex flex-1 pt-16">
    <SidebarComponent {isSidebarOpen} onCloseMobile={closeSidebar} />

    <main class="flex-1 overflow-x-auto md:pl-64">
      {@render children()}
    </main>
  </div>
</div>
