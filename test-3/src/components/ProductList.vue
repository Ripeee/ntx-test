<template>
  <div class="product-list">
    <h3>Products <span v-if="category">(in {{ category.name }})</span></h3>
    <button @click="openAddProductForm" :disabled="!category" title="Add Product (select a category first)">Add New Product</button>

    <div v-if="!category && !loading">
        <p>Please select a category from the tree.</p>
    </div>
     <div v-else-if="loading">
         <p>Loading products...</p>
     </div>
    <div v-else-if="products && products.length === 0">
      <p>No products found in this category.</p>
    </div>
    <ul v-else class="product-items">
      <li v-for="product in products" :key="product.id" class="product-item">
        <span>{{ product.name }} - Rp {{ product.price?.toFixed(2) || 'N/A' }}</span>
        <span class="product-actions">
          <button @click="openEditProductForm(product)" title="Edit Product">✎</button>
          <button @click="deleteProduct(product.id)" title="Delete Product" class="delete-button">✕</button>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useProductStore } from '@/stores/productStore';
import { computed } from 'vue';

// Mendefinisikan props
const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
   loading: { // Prop loading dari store
       type: Boolean,
       default: false,
   }
});

// Mendefinisikan emits
const emit = defineEmits(['open-add-product-form', 'open-edit-product-form', 'delete-product']);

const productStore = useProductStore();

// Dapatkan objek kategori yang dipilih untuk ditampilkan namanya
const category = computed(() =>
    productStore.getCategoryById(productStore.selectedCategoryId)
);

// Membuka form tambah produk
const openAddProductForm = () => {
     if(productStore.selectedCategoryId){
        emit('open-add-product-form', productStore.selectedCategoryId);
     }
};

// Membuka form edit produk
const openEditProductForm = (product) => {
    emit('open-edit-product-form', product);
};

// Menghapus produk (dipanggil dari parent View)
const deleteProduct = (productId) => {
    emit('delete-product', productId);
};

</script>

<style scoped>
.product-list {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}
.product-items {
  list-style: none;
  padding: 0;
}
.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 4px;
  background-color: #fff;
}
 .product-item span:first-child {
     flex-grow: 1;
     margin-right: 10px;
 }
.product-actions button {
    margin-left: 5px;
    padding: 2px 6px;
    cursor: pointer;
    border: 1px solid #ccc;
    background-color: #fff;
    border-radius: 3px;
}
  .product-actions button:hover {
     background-color: #eee;
 }
 .delete-button {
     color: red;
 }
</style>