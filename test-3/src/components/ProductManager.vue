<template>
  <div class="product-manager">
    <div class="card">
      <div class="card-header">
        <h2>Products</h2>
        <button @click="showAddForm" class="btn btn-primary">Add Product</button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error.message }}</div>
        <div v-else>
          <div class="table-responsive">
            <table class="product-table">
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
                  <td>{{ getCategoryName(product.categoryId) }}</td>
                  <td class="actions">
                    <button @click="editProduct(product)" class="btn btn-sm btn-edit">Edit</button>
                    <button @click="confirmDeleteProduct(product.id)" class="btn btn-sm btn-delete">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Edit' : 'Add' }} Product</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProduct">
            <div class="form-group">
              <label for="productName">Name</label>
              <input 
                id="productName" 
                v-model="form.name" 
                type="text" 
                required 
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="price">Price</label>
              <input 
                id="price" 
                v-model.number="form.price" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="productCategory">Category</label>
              <select 
                id="productCategory" 
                v-model="form.categoryId" 
                required 
                class="form-control"
              >
                <option 
                  v-for="category in flatCategories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <input 
                id="description" 
                v-model="form.description" 
                type="text"
                required 
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="stock">Stock</label>
              <input 
                id="stock" 
                v-model.number="form.stock" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="image">Image</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="form-control"
                ref="fileInput"
              >
              <small class="form-text text-muted">
                Recommended size: 800x800px, Max size: 2MB
              </small>
              <div v-if="form.imagePreview" class="mt-2">
                <img :src="form.imagePreview" class="img-thumbnail" width="100">
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useProductStore } from '../stores/products'
import { useCategoryStore } from '../stores/categories'

export default {
  setup() {
    // onMounted(async () => {
    //   try {
    //     await productStore.fetchProducts();
    //   } catch (error) {
    //     console.error("Failed to load products:", error);
    //   }
    // });

    const productStore = useProductStore()
    const categoryStore = useCategoryStore()
    const showModal = ref(false)
    const editingProduct = ref(null)
    const form = ref({
      name: '',
      price: 0,
      categoryId: null,
			description: '',
			stock: 0,
      image: null,
      imagePreview: null
    })
    
    const fileInput = ref(null);

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      
      if (file) {
        // Validate file type
        if (!file.type.match('image.*')) {
          alert('Please select an image file');
          return;
        }

        // Validate file size (e.g., 2MB max)
        if (file.size > 2 * 1024 * 1024) {
          alert('File size should be less than 2MB');
          return;
        }

        form.value.image = file;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          form.value.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const resetForm = () => {
      form.value = {
        // ... reset other fields
        image: null,
        imagePreview: null
      };
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const flatCategories = computed(() => {
      const flatten = (categories) => {
        return categories.reduce((acc, category) => {
          return [...acc, category, ...flatten(category.children)]
        }, [])
      }
      return flatten(categoryStore.categoryTree)
    })

    const getCategoryName = (id) => {
      const category = flatCategories.value.find(c => c.id === id)
      return category ? category.name : 'Uncategorized'
    }

    const showAddForm = () => {
      editingProduct.value = null
      form.value = { name: '', price: 0, categoryId: null }
      showModal.value = true
    }

    const editProduct = (product) => {
      editingProduct.value = product
      form.value = { ...product }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }

    const saveProduct = async () => {
      if (editingProduct.value) {
        await productStore.updateProduct({ 
          id: editingProduct.value.id, 
          ...form.value 
        })
      } else {
        await productStore.addProduct(form.value)
      }
      closeModal()
    }

    const confirmDeleteProduct = (id) => {
      if (confirm('Are you sure you want to delete this product?')) {
        productStore.deleteProduct(id)
      }
    }

    // Fetch data on component mount
    productStore.fetchProducts()
    categoryStore.fetchCategories()

    return {
      loading: computed(() => productStore.loading || categoryStore.loading),
      error: computed(() => productStore.error || categoryStore.error),
      products: computed(() => productStore.products),
      hasProducts: computed(() => productStore.products.length > 0),
      categories: computed(() => categoryStore.categories),
      handleImageUpload,
      flatCategories,
      getCategoryName,
      showModal,
      editingProduct,
      form,
      showAddForm,
      editProduct,
      closeModal,
      saveProduct,
      confirmDeleteProduct
    }
  }
}
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.card-body {
  padding: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
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
  gap: 8px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.product-manager {
  max-width: 1000px;
  margin: 0 auto;
}

.table-responsive {
  overflow-x: auto;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th, .product-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.product-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-edit {
  background: #2196F3;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

</style>