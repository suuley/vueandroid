<template>
  <nav class="topnav">
    <router-link to="/" class="nav-link">🔍 Search</router-link>
    <router-link to="/table" class="nav-link">📋 Dashboard</router-link>
    <router-link to="/register" class="nav-link">➕ Register</router-link>
    <router-link to="/payment" class="nav-link">💳 Payment</router-link>
  </nav>
  <router-view />
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f4f6f8; color: #1f2937; padding: 40px 16px; }
.container { max-width: 760px; margin: 0 auto; }
header { text-align: center; margin-bottom: 28px; }
.logo { font-size: 52px; }
h1 { font-size: 28px; margin-top: 4px; }
.rate { color: #6b7280; margin-top: 6px; }
.rate strong { color: #d97706; }
.message { margin-top: 20px; padding: 14px; background: #fee2e2; color: #991b1b; border-radius: 10px; text-align: center; }
.topnav { display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; }
.nav-link { padding: 10px 18px; border-radius: 10px; background: #fff; color: #1f2937; text-decoration: none; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.nav-link.router-link-exact-active { background: #f59e0b; color: #fff; }
</style>