
<template>
  <div class="form-container">
    <h3>{{ isEditing ? 'Edit Category' : 'Add New Category' }}</h3>
    <form @submit.prevent="submitForm">
      <div>
        <label for="category-name">Name:</label>
        <input type="text" id="category-name" v-model="formData.name" required />
      </div>
      <div>
        <label for="category-parent">Parent Category:</label>
        <select id="category-parent" v-model="formData.parentId">
          <option :value="null">-- Top Level --</option>
          <option
             v-for="cat in availableParentCategories"
             :key="cat.id"
             :value="cat.id">
             {{ cat.name }}
          </option>
        </select>
      </div>
      <button type="submit" :disabled="loading">{{ loading ? 'Saving...' : 'Save Category' }}</button>
      <button type="button" @click="$emit('cancel')">Cancel</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useProductStore } from '@/stores/productStore';

const props = defineProps({
  categoryData: { // Data kategori jika mode edit
    type: Object,
    default: null,
  },
   parentId: { // Parent ID jika mode tambah subkategori
       type: String,
       default: null,
   },
   loading: { // Prop loading dari store
       type: Boolean,
       default: false,
   }
});

const emit = defineEmits(['submit', 'cancel']);

const productStore = useProductStore();

const isEditing = computed(() => !!props.categoryData);

// Inisialisasi form data
const formData = ref({
  id: props.categoryData?.id || null,
  name: props.categoryData?.name || '',
  parentId: props.categoryData?.parentId || props.parentId || null,
});

// Watch categoryData atau parentId untuk reset form saat props berubah
 watch(() => props.categoryData, (newData) => {
     formData.value = {
         id: newData?.id || null,
         name: newData?.name || '',
         parentId: newData?.parentId || props.parentId || null,
     };
 });
  watch(() => props.parentId, (newParentId) => {
     // Hanya update parentId jika tidak dalam mode edit ATAU jika parentId memang berubah
     if (!props.categoryData || formData.value.parentId !== newParentId) {
        formData.value.parentId = newParentId;
     }
      // Jika dari mode edit ke tambah (categoryData jadi null)
      if (!props.categoryData) {
         formData.value.id = null;
         formData.value.name = '';
      }
  });


 // Filter kategori yang bisa dijadikan parent
 const availableParentCategories = computed(() => {
     // Tidak bisa memilih kategori yang sedang diedit
     // Tidak bisa memilih anak atau cucu dari kategori yang sedang diedit (untuk menghindari loop)
     const categories = productStore.categories;
     const currentCategoryId = formData.value.id;

     if (!currentCategoryId) {
        // Mode tambah: Semua kategori bisa jadi parent
        return categories;
     }

     // Mode edit: Filter kategori yang valid
     const invalidParents = [currentCategoryId]; // Tidak bisa jadi parent dari dirinya sendiri

     // Cari semua anak dan cucu dari kategori yang sedang diedit
     const findChildrenIds = (id) => {
         const children = categories.filter(cat => cat.parentId === id);
         invalidParents.push(...children.map(c => c.id));
         children.forEach(child => findChildrenIds(child.id));
     };
     findChildrenIds(currentCategoryId);

     return categories.filter(cat => !invalidParents.includes(cat.id));
 });


// Submit form
const submitForm = () => {
  // Validasi dasar jika perlu
  if (!formData.value.name) {
    alert('Category name is required.');
    return;
  }
   // Kirim data (sesuaikan format jika GraphQL butuh ID parent sebagai string/null)
  emit('submit', {
     id: formData.value.id, // id hanya ada saat edit
     name: formData.value.name,
     parentId: formData.value.parentId,
  });
};
</script>

<style scoped>
.form-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
form div {
  margin-bottom: 10px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input[type="text"], select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Include padding in width */
}
button {
  margin-right: 10px;
  padding: 8px 15px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
}
button:hover:not(:disabled) {
  background-color: #0056b3;
}
 button:disabled {
     opacity: 0.5;
     cursor: not-allowed;
 }
 button[type="button"] { /* Cancel button */
     background-color: #6c757d;
 }
  button[type="button"]:hover:not(:disabled) {
     background-color: #5a6268;
  }
</style>