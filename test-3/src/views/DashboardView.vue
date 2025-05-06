<template>
  <div class="dashboard-view">
    <h2>Summary Dashboard</h2>

    <div v-if="productStore.loading" class="loading-indicator">Loading data...</div>
    <div v-else-if="productStore.error" class="error-message">Error: {{ productStore.error.message }}</div>
    <div v-else>
      <div class="summary-cards">
        <div class="card">
          <h3>Total Categories</h3>
          <p>{{ productStore.categories.length }}</p>
        </div>
         <div class="card">
          <h3>Total Products</h3>
          <p>{{ productStore.products.length }}</p>
        </div>
      </div>

      <h3>Category Overview (Recursive Totals)</h3>
      <table class="category-summary-table">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Total Products (Recursive)</th>
            <th>Total Price (Recursive)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="productStore.categoryTree.length === 0">
             <td colspan="3">No top-level categories found.</td>
          </tr>
          <tr v-for="category in productStore.categoryTree" :key="category.id">
            <td>{{ category.name }}</td>
            <td>{{ productStore.getCategoryTotalRecursiveProductCount(category.id) }}</td>
            <td>Rp {{ productStore.getCategoryTotalRecursivePrice(category.id)?.toFixed(2) || '0.00' }}</td>
          </tr>
        </tbody>
      </table>

       <div class="visualization-section">
           <h3>Data Visualization (Placeholder)</h3>
           <p>Integrasikan library chart (misal: Chart.js) di sini untuk visualisasi data kategori atau produk.</p>
           </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';

const productStore = useProductStore();

onMounted(() => {
  // Ambil data saat dashboard dimuat jika belum ada
   if (productStore.categories.length === 0 || productStore.products.length === 0) {
       productStore.fetchData();
   }
});

// Catatan: Anda bisa menambahkan logic untuk inisialisasi chart di sini
// setelah data dimuat, menggunakan watcher pada store.categories atau store.products
// atau setelah loading state menjadi false.
// Contoh: watch(() => [productStore.categories, productStore.products, productStore.loading], ([cats, prods, loading]) => {
//   if (!loading && (cats.length > 0 || prods.length > 0)) {
//     // Inisialisasi atau update chart di sini
//   }
// }, { immediate: true });

</script>

<style scoped>
.dashboard-view {
  padding: 20px;
}
.loading-indicator, .error-message {
    text-align: center;
    margin-top: 20px;
    font-weight: bold;
}
 .error-message {
     color: red;
 }
.summary-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    flex-wrap: wrap; /* Responsive */
}
.card {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    flex: 1; /* Ambil ruang */
    min-width: 200px; /* Lebar minimum */
    text-align: center;
}
 .card h3 {
     margin-top: 0;
     font-size: 1.1em;
     color: #333;
 }
 .card p {
     font-size: 1.5em;
     font-weight: bold;
     color: #007bff;
     margin-bottom: 0;
 }

.category-summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}
.category-summary-table th, .category-summary-table td {
    border: 1px solid #dee2e6;
    padding: 10px;
    text-align: left;
}
.category-summary-table th {
    background-color: #e9ecef;
    font-weight: bold;
}
.category-summary-table tbody tr:nth-child(even) {
    background-color: #f8f9fa;
}
 .category-summary-table td:nth-child(2), /* Product Count */
 .category-summary-table td:nth-child(3) { /* Total Price */
    text-align: right;
    font-family: monospace; /* Harga/angka lebih rapi */
 }

.visualization-section {
    margin-top: 40px;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    background-color: #fff;
}
</style>