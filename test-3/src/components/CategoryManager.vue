<template>
  <div class="category-manager">
    <div class="card">
      <div class="card-header">
        <h2>Categories</h2>
        <button @click="showAddForm" class="btn btn-primary">Add Category</button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error.message }}</div>
        <div v-else>
          <CategoryTree 
            :categories="categoryTree" 
            @edit="editCategory" 
            @delete="confirmDeleteCategory"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingCategory ? 'Edit' : 'Add' }} Category</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label for="name">Name</label>
              <input 
                id="name" 
                v-model="form.name" 
                type="text" 
                required 
                class="form-control"
              >
            </div>
            <div class="form-group">
              <label for="parent">Parent Category</label>
              <select 
                id="parent" 
                v-model="form.parentId" 
                class="form-control"
              >
                <option :value="null">None</option>
                <option 
                  v-for="category in flatCategories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
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
import { computed, ref, onMounted } from 'vue';
import { useCategoryStore } from '../stores/categories'
import CategoryTree from './CategoryTree.vue'

export default {
  components: { CategoryTree }, 
  setup() {
    const categoryStore = useCategoryStore()
    const showModal = ref(false)
    const editingCategory = ref(null)
    const form = ref({
      name: '',
      parentId: null
    })

    const flatCategories = computed(() => {
      const flatten = (categories) => {
        return categories.reduce((acc, category) => {
          return [...acc, category, ...flatten(category.children)]
        }, [])
      }
      return flatten(categoryStore.categoryTree)
    })

    const showAddForm = () => {
      editingCategory.value = null
      form.value = { name: '', parentId: null }
      showModal.value = true
    }

    const editCategory = (category) => {
      editingCategory.value = category
      form.value = { ...category }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }

    const saveCategory = async () => {
      try {
        if (editingCategory.value) {
          await categoryStore.updateCategory({ 
            id: editingCategory.value.id, 
            name: form.value.name,
            parentId: form.value.parentId || null // Ensure parentId is null if empty
          });
        } else {
          console.log('add', form.value);
          await categoryStore.addCategory({
            name: form.value.name,
            parentId: form.value.parentId || null
          });
        }
        closeModal();
      } catch (error) {
        // Handle error (show message to user, etc.)
        console.error("Failed to save category:", error);
      }
    }

    const confirmDeleteCategory = (id) => {
      if (confirm('Are you sure you want to delete this category?')) {
        categoryStore.deleteCategory(id)
      }
    }

    // Fetch categories on component mount
    categoryStore.fetchCategories()

    return {
      loading: computed(() => categoryStore.loading),
      error: computed(() => categoryStore.error),
      categoryTree: computed(() => categoryStore.categoryTree),
      showModal,
      editingCategory,
      form,
      flatCategories,
      showAddForm,
      editCategory,
      closeModal,
      saveCategory,
      confirmDeleteCategory
    }
  }
}
</script>

<style scoped>
  .category-manager {
    max-width: 800px;
    margin: 0 auto;
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

  .btn-secondary {
    background: #f0f0f0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

  @media (max-width: 600px) {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>