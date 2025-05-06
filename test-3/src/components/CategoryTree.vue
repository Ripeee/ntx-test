<template>
  <div class="category-tree">
    <h3>Categories</h3>
    <div class="tree-nodes">
        <div v-if="!categories || categories.length === 0">
             <p v-if="level === 0">No categories found.</p>
             <p v-else>No subcategories.</p>
        </div>
        <div v-for="category in categories" :key="category.id" :style="{'margin-left': (level * 15) + 'px'}" class="category-node">
          <div class="node-content">
            <span class="category-name" @click="selectCategory(category.id)">
               📂 {{ category.name }} ({{ getRecursiveProductCount(category.id) }} produk)
            </span>
            <span class="category-actions">
                <button @click="openAddCategoryForm(category.id)" title="Add Subcategory">+</button>
                <button @click="openEditCategoryForm(category)" title="Edit Category">✎</button>
                <button @click="deleteCategory(category.id)" title="Delete Category" class="delete-button">✕</button>
            </span>
          </div>
          <CategoryTree
            :categories="category.subcategories"
            :level="level + 1"
            @select-category="$emit('select-category', $event)"
             @open-add-category-form="$emit('open-add-category-form', $event)"
             @open-edit-category-form="$emit('open-edit-category-form', $event)"
             @delete-category="$emit('delete-category', $event)"
          />
        </div>
    </div>
  </div>
</template>

<script setup>
import { useProductStore } from '@/stores/productStore';
import { computed } from 'vue';

// Mendefinisikan props
const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  level: {
    type: Number,
    default: 0,
  },
});

// Mendefinisikan emits
const emit = defineEmits(['select-category', 'open-add-category-form', 'open-edit-category-form', 'delete-category']);

const productStore = useProductStore();

// Memilih kategori
const selectCategory = (categoryId) => {
  productStore.selectCategory(categoryId);
  emit('select-category', categoryId); // Emit juga ke parent
};

 // Membuka form tambah subkategori
const openAddCategoryForm = (parentId) => {
    emit('open-add-category-form', parentId);
};

// Membuka form edit kategori
const openEditCategoryForm = (category) => {
    emit('open-edit-category-form', category);
};

// Menghapus kategori (dipanggil dari parent View)
const deleteCategory = (categoryId) => {
    emit('delete-category', categoryId);
};


// Menggunakan getter rekursif dari store
const getRecursiveProductCount = computed(() => (categoryId) => {
    // Perlu berhati-hati saat memanggil getter di computed atau getter lain.
    // Pastikan data categories dan products sudah ada di store sebelum memanggil
    // getter rekursif yang bergantung pada data tersebut.
    // Dalam contoh ini, getter dipanggil di template, jadi dia akan bereaksi
    // terhadap perubahan state products/categories di store.
    return productStore.getCategoryTotalRecursiveProductCount(categoryId);
});

 // Jika perlu menampilkan harga rekursif di tree juga:
 // const getRecursiveTotalPrice = computed(() => (categoryId) => {
 //    return productStore.getCategoryTotalRecursivePrice(categoryId);
 // });

</script>

<style scoped>
.category-tree {
  /* Gaya untuk container tree */
}
.tree-nodes {
    /* Container untuk node-node dalam tree */
}
.category-node {
  /* Gaya untuk setiap node kategori */
  margin-bottom: 5px;
  /* margin-left diatur inline */
  border: 1px solid #eee;
  padding: 5px;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.node-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.category-name {
  cursor: pointer;
  font-weight: bold;
  flex-grow: 1; /* Ambil sisa ruang */
  padding: 2px 5px; /* Padding agar mudah diklik */
}
.category-name:hover {
    text-decoration: underline;
    color: #007bff;
}
.category-actions button {
    margin-left: 5px;
    padding: 2px 6px;
    cursor: pointer;
    border: 1px solid #ccc;
    background-color: #fff;
    border-radius: 3px;
}
 .category-actions button:hover {
     background-color: #eee;
 }
 .delete-button {
     color: red;
 }
</style>