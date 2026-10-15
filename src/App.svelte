<script>
  import { onMount } from "svelte";
  import { currentPath, resolveRoute, navigate } from "./router";
  import { getAccessToken } from "./helpers/apiHelper";
  import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
  import LoginPage from "./features/auth/pages/LoginPage.svelte";
  import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
  import UsersPage from "./features/users/pages/UsersPage.svelte";
  import ProfilePage from "./features/users/pages/ProfilePage.svelte";
  import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";
  import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
  import HomePage from "./features/linktrees/pages/HomePage.svelte";
  import DetailPage from "./features/linktrees/pages/DetailPage.svelte";

  const route = $derived(resolveRoute($currentPath));

  const isAuthPage = $derived(
    $currentPath === "/auth/login" || $currentPath === "/auth/register"
  );

  // Guard: kalau bukan halaman auth dan tidak ada token, tendang ke login
  $effect(() => {
    if (typeof window === "undefined") return;
    const token = getAccessToken();
    if (!isAuthPage && !token) {
      navigate("/auth/login");
    }
  });
</script>

{#if isAuthPage}
  <AuthLayout>
    {#if route.page === "login"}
      <LoginPage />
    {:else if route.page === "register"}
      <RegisterPage />
    {/if}
  </AuthLayout>
{:else}
  <LinkTreeLayout>
    {#if route.page === "home"}
      <HomePage />
    {:else if route.page === "detail"}
      <DetailPage linkTreeId={route.params.linkTreeId} />
    {:else if route.page === "users"}
      <UsersPage />
    {:else if route.page === "profile"}
      <ProfilePage />
    {:else}
      <NotFoundPage />
    {/if}
  </LinkTreeLayout>
{/if}