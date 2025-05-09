<template>
  <div class="dashboard">
    <h1>Product Management Dashboard</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Categories</h3>
        <p>{{ totalCategories }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Products</h3>
        <p>{{ totalProducts }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Inventory Value</h3>
        <p>${{ totalValue.toFixed(2) }}</p>
      </div>
    </div>

    <div class="category-summary">
      <h2>Category Summary</h2>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error.message }}</div>
      <div v-else>
        <ul class="category-list">
          <CategorySummaryItem 
            v-for="category in categoryTree" 
            :key="category.id" 
            :category="category" 
            :products="products"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useCategoryStore } from '../stores/categories'
import { useProductStore } from '../stores/products'
import CategorySummaryItem from '@/components/CategorySummaryItem.vue'

export default {
  components: { CategorySummaryItem },
  setup() {
    const categoryStore = useCategoryStore()
    const productStore = useProductStore()

    // Fetch data on component mount
    categoryStore.fetchCategories()
    productStore.fetchProducts()

    const totalCategories = computed(() => {
      const flatten = (categories) => {
        return categories.reduce((acc, category) => {
          return acc + 1 + flatten(category.children)
        }, 0)
      }
      return flatten(categoryStore.categoryTree)
    })

    const totalProducts = computed(() => productStore.products.length)

    const totalValue = computed(() => {
      return productStore.products.reduce((sum, product) => sum + product.price, 0)
    })

    return {
      loading: computed(() => categoryStore.loading || productStore.loading),
      error: computed(() => categoryStore.error || productStore.error),
      categoryTree: computed(() => categoryStore.categoryTree),
      products: computed(() => productStore.products),
      totalCategories,
      totalProducts,
      totalValue
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin-top: 0;
  color: #666;
  font-size: 1.1rem;
}

.stat-card p {
  font-size: 2rem;
  margin: 10px 0 0;
  font-weight: bold;
  color: #4CAF50;
}

.category-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.category-summary h2 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.loading, .error {
  padding: 20px;
  text-align: center;
}

.error {
  color: #f44336;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>