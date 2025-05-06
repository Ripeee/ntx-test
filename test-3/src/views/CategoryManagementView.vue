<template>
  <div class="category-management-view">
    <h2>Category and Product Management</h2>

    <div v-if="productStore.loading" class="loading-indicator">Loading data...</div>
    <div v-else-if="productStore.error" class="error-message">Error: {{ productStore.error.message }}</div>
    <div v-else class="management-layout">
      <div class="category-panel">
        <CategoryTree
          :categories="productStore.categoryTree"
          @select-category="productStore.selectCategory"
          @open-add-category-form="handleOpenAddCategoryForm"
          @open-edit-category-form="handleOpenEditCategoryForm"
          @delete-category="handleDeleteCategory"
        />
         <button @click="handleOpenAddCategoryForm(null)" class="add-top-category-button">Add Top Level Category</button>
      </div>

      <div class="product-panel">
        <ProductList
          :products="productStore.getProductsByCategoryId(productStore.selectedCategoryId)"
          :loading="productStore.loading"
          @open-add-product-form="handleOpenAddProductForm"
          @open-edit-product-form="handleOpenEditProductForm"
          @delete-product="handleDeleteProduct"
        />
      </div>
    </div>

    <div v-if="showCategoryForm" class="modal-overlay">
        <div class="modal-content">
            <CategoryForm
                :category-data="editCategoryData"
                :parent-id="newCategoryParentId"
                :loading="productStore.loading"
                @submit="handleCategorySubmit"
                @cancel="handleCancelCategoryForm"
            />
        </div>
    </div>

     <div v-if="showProductForm" class="modal-overlay">
        <div class="modal-content">
            <ProductForm
                :product-data="editProductData"
                :category-id="newProductCategoryId"
                :loading="productStore.loading"
                @submit="handleProductSubmit"
                @cancel="handleCancelProductForm"
            />
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import CategoryTree from '@/components/CategoryTree.vue';
import ProductList from '@/components/ProductList.vue';
import CategoryForm from '@/components/CategoryForm.vue';
import ProductForm from '@/components/ProductForm.vue';

const productStore = useProductStore();

// --- State untuk Modal Form ---
const showCategoryForm = ref(false);
const editCategoryData = ref(null); // Data kategori jika mode edit
const newCategoryParentId = ref(null); // Parent ID jika mode tambah

const showProductForm = ref(false);
const editProductData = ref(null); // Data produk jika mode edit
const newProductCategoryId = ref(null); // Category ID jika mode tambah

// --- Lifecycle ---
onMounted(() => {
  // Ambil data saat komponen dimuat jika belum ada
   if (productStore.categories.length === 0 || productStore.products.length === 0) {
       productStore.fetchData();
   }
});

// --- Category Form Handlers ---
const handleOpenAddCategoryForm = (parentId = null) => {
    editCategoryData.value = null; // Pastikan mode tambah
    newCategoryParentId.value = parentId; // Set parent jika tambah subkategori
    showCategoryForm.value = true;
};

const handleOpenEditCategoryForm = (category) => {
    editCategoryData.value = category; // Set data untuk edit
    newCategoryParentId.value = null; // Reset parentId untuk tambah
    showCategoryForm.value = true;
};

const handleCategorySubmit = async (formData) => {
    if (formData.id) {
        // Mode edit
        await productStore.updateCategory(formData.id, { name: formData.name, parentId: formData.parentId });
    } else {
        // Mode tambah
        await productStore.createCategory({ name: formData.name, parentId: formData.parentId });
    }
    // Tutup form setelah selesai (baik sukses atau error, agar user lihat error message jika ada)
    // Atau hanya tutup jika sukses: if (!productStore.error) { showCategoryForm.value = false; }
     showCategoryForm.value = false;
     editCategoryData.value = null;
     newCategoryParentId.value = null;
};

const handleCancelCategoryForm = () => {
    showCategoryForm.value = false;
    editCategoryData.value = null;
    newCategoryParentId.value = null;
};

const handleDeleteCategory = async (categoryId) => {
     // Konfirmasi sudah ada di store action
    await productStore.deleteCategory(categoryId);
     // Store action sudah mengupdate selectedCategoryId jika perlu
};

// --- Product Form Handlers ---
 const handleOpenAddProductForm = (categoryId) => {
    if (!categoryId) {
        alert('Please select a category first to add a product.');
        return;
    }
    editProductData.value = null; // Pastikan mode tambah
    newProductCategoryId.value = categoryId; // Set kategori produk baru
    showProductForm.value = true;
};

const handleOpenEditProductForm = (product) => {
    editProductData.value = product; // Set data untuk edit
    newProductCategoryId.value = null; // Reset categoryId untuk tambah
    showProductForm.value = true;
};

const handleProductSubmit = async (formData) => {
    if (formData.id) {
        // Mode edit
        await productStore.updateProduct(formData.id, { name: formData.name, price: formData.price, categoryId: formData.categoryId });
    } else {
        // Mode tambah
        await productStore.createProduct({ name: formData.name, price: formData.price, categoryId: formData.categoryId });
    }
     // Tutup form setelah selesai
    showProductForm.value = false;
    editProductData.value = null;
    newProductCategoryId.value = null;
};

const handleDeleteProduct = async (productId) => {
    // Konfirmasi sudah ada di store action
    await productStore.deleteProduct(productId);
};

</script>

<style scoped>
.category-management-view {
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

.management-layout {
  display: flex;
  gap: 20px;
  flex-wrap: wrap; /* Untuk responsivitas */
}

.category-panel {
  flex: 1; /* Ambil sebagian ruang */
  min-width: 280px; /* Lebar minimum */
  max-width: 350px; /* Lebar maksimum untuk panel kategori */
  border-right: 1px solid #eee; /* Garis pemisah */
  padding-right: 20px;
}

.product-panel {
  flex: 2; /* Ambil ruang lebih banyak */
  min-width: 300px; /* Lebar minimum */
}

.add-top-category-button {
    margin-top: 15px;
    padding: 8px 15px;
    cursor: pointer;
    border: 1px solid #007bff;
    border-radius: 4px;
    background-color: #fff;
    color: #007bff;
    font-weight: bold;
}
 .add-top-category-button:hover {
     background-color: #e9ecef;
 }

/* --- Modal Styling --- */
.modal-overlay {
    position: fixed; /* Muncul di atas segalanya */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Background semi-transparan */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* Pastikan di atas konten lain */
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px; /* Lebar maksimum modal */
    width: 90%; /* Lebar responsif */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
     /* Gaya dari form-container sudah cukup, modal-content hanya sebagai wrapper */
     /* Hapus padding/margin dari form-container jika menggunakan modal-content */
     .form-container {
         margin-top: 0;
         padding: 0;
         border: none;
         background: none;
     }
}
</style>