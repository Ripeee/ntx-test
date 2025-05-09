<template>
  <div class="product-crud">
    <!-- Create Product -->
    <div class="card">
      <div class="card-header">
        <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitProduct">
          <div class="form-group">
            <label>Name</label>
            <input v-model="form.name" type="text" required class="form-control">
          </div>
          
          <div class="form-group">
            <label>Price</label>
            <input v-model.number="form.price" type="number" step="0.01" required class="form-control">
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" class="form-control"></textarea>
          </div>
          
          <div class="form-group">
            <label>Category</label>
            <select v-model="form.categoryId" required class="form-control">
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cancelEdit" class="btn btn-secondary" v-if="editingProduct">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingProduct ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Products List -->
    <div class="card mt-4">
      <div class="card-header">
        <h3>Product List</h3>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error.message }}</div>
        <div v-else>
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>{{ product.name }}</td>
                <td>${{ product.price.toFixed(2) }}</td>
                <td>{{ product.category?.name }}</td>
                <td>
                  <button @click="editProduct(product)" class="btn btn-sm btn-edit">Edit</button>
                  <button @click="deleteProduct(product.id)" class="btn btn-sm btn-delete">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/products'
import { useCategoryStore } from '../stores/categories'

export default {
  setup() {
    const productStore = useProductStore()
    const categoryStore = useCategoryStore()
    
    const form = ref({
      name: '',
      price: 0,
      description: '',
      categoryId: ''
    })
    
    const editingProduct = ref(null)
    
    // Fetch data on component mount
    onMounted(async () => {
      await productStore.fetchProducts()
      await categoryStore.fetchCategories()
    })
    
    const submitProduct = async () => {
      if (editingProduct.value) {
        await productStore.updateProduct(editingProduct.value.id, form.value)
      } else {
        await productStore.addProduct(form.value)
      }
      resetForm()
    }
    
    const editProduct = (product) => {
      editingProduct.value = product
      form.value = {
        name: product.name,
        price: product.price,
        description: product.description,
        categoryId: product.category?.id || ''
      }
    }
    
    const deleteProduct = async (id) => {
      if (confirm('Are you sure you want to delete this product?')) {
        await productStore.deleteProduct(id)
      }
    }
    
    const cancelEdit = () => {
      editingProduct.value = null
      resetForm()
    }
    
    const resetForm = () => {
      form.value = {
        name: '',
        price: 0,
        description: '',
        categoryId: ''
      }
      editingProduct.value = null
    }
    
    return {
      form,
      editingProduct,
      products: productStore.products,
      categories: categoryStore.categories,
      loading: productStore.loading,
      error: productStore.error,
      submitProduct,
      editProduct,
      deleteProduct,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.product-crud {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.card-header {
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.card-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-edit {
  background-color: #ffc107;
  color: black;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table th {
  background-color: #f8f9fa;
}

.loading {
  text-align: center;
  padding: 20px;
}

.error {
  color: #dc3545;
  padding: 20px;
  text-align: center;
}
</style>