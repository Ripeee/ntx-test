<template>
  <div class="form-container">
    <h3>{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h3>
    <form @submit.prevent="submitForm">
      <div>
        <label for="product-name">Name:</label>
        <input type="text" id="product-name" v-model="formData.name" required />
      </div>
      <div>
        <label for="product-price">Price:</label>
        <input type="number" id="product-price" v-model.number="formData.price" required min="0" step="0.01" />
      </div>
       <div>
        <label for="product-category">Category:</label>
        <select id="product-category" v-model="formData.categoryId" required>
          <option :value="null" disabled>-- Select a Category --</option>
          <option
             v-for="cat in productStore.categories"
             :key="cat.id"
             :value="cat.id">
             {{ cat.name }}
          </option>
        </select>
      </div>
      <button type="submit" :disabled="loading">{{ loading ? 'Saving...' : 'Save Product' }}</button>
      <button type="button" @click="$emit('cancel')">Cancel</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useProductStore } from '@/stores/products';

const props = defineProps({
  productData: { // Data produk jika mode edit
    type: Object,
    default: null,
  },
   categoryId: { // Category ID jika mode tambah produk
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

const isEditing = computed(() => !!props.productData);

// Inisialisasi form data
const formData = ref({
  id: props.productData?.id || null,
  name: props.productData?.name || '',
  price: props.productData?.price || 0,
  categoryId: props.productData?.categoryId || props.categoryId || null,
});

// Watch productData atau categoryId untuk reset form saat props berubah
 watch(() => props.productData, (newData) => {
     formData.value = {
         id: newData?.id || null,
         name: newData?.name || '',
         price: newData?.price || 0,
         categoryId: newData?.categoryId || props.categoryId || null,
     };
 });
  watch(() => props.categoryId, (newCategoryId) => {
     // Hanya update categoryId jika tidak dalam mode edit ATAU jika categoryId memang berubah
     if (!props.productData || formData.value.categoryId !== newCategoryId) {
        formData.value.categoryId = newCategoryId;
     }
      // Jika dari mode edit ke tambah (productData jadi null)
      if (!props.productData) {
         formData.value.id = null;
         formData.value.name = '';
         formData.value.price = 0;
      }
  });

// Submit form
const submitForm = () => {
  // Validasi dasar jika perlu
  if (!formData.value.name || formData.value.price === null || formData.value.categoryId === null) {
    alert('Name, price, and category are required.');
    return;
  }
  emit('submit', {
     id: formData.value.id, // id hanya ada saat edit
     name: formData.value.name,
     price: parseFloat(formData.value.price), // Pastikan price adalah number/float
     categoryId: formData.value.categoryId,
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
input[type="text"], input[type="number"], select {
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