<template>
  <div class="app-container">
    <nav class="navbar">
      <router-link to="/" class="nav-link">Dashboard</router-link>
      <router-link to="/categories" class="nav-link">Categories</router-link>
      <router-link to="/products" class="nav-link">Products</router-link>
    </nav>
    
    <div class="content"> 
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  background: #4CAF50;
  padding: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav-link:hover, .nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .content {
    padding: 1rem;
  }
}
</style>