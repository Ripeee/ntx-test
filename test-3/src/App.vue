<template>
  <div id="app">
    <nav>
      <router-link to="/dashboard">Dashboard</router-link> |
      <router-link to="/categories">Manage Categories & Products</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
// Tidak perlu script khusus di sini untuk contoh dasar ini
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
   /* Gaya dasar agar konten tidak menempel di pinggir */
  padding: 0;
  margin: 0;
  min-height: 100vh;
  background-color: #f8f9fa;
}

nav {
  padding: 15px;
  background-color: #e9ecef;
  margin-bottom: 20px;
  text-align: center;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #007bff;
}

/* Gaya dasar untuk body/html agar aplikasi mengambil tinggi penuh */
html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    /* min-height: 100vh; */ /* Dikelola di #app */
}
</style>