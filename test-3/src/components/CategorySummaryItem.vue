<template>
  <li class="summary-item">
    <div class="summary-header" @click="toggleExpanded">
      <div :class="hasChildren ? '' : 'w-[20px] invisible'">
      </div>  
        <span class="toggle-icon" v-if="hasChildren">{{ expanded ? '−' : '+' }}</span>
      <span class="category-name text-blue-300">{{ category.name }}</span>
      <span class="category-stats">
        {{ productCount }} products • ${{ categoryTotal.toFixed(2) }}
      </span>
    </div>
    <ul v-if="expanded && category.children.length > 0" class="children-list">
      <CategorySummaryItem 
        v-for="child in category.children" 
        :key="child.id" 
        :category="child" 
        :products="products"
      />
    </ul>
  </li>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CategorySummaryItem',
  props: {
    category: {
      type: Object,
      required: true
    },
    products: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const expanded = ref(false)
     const hasChildren = computed(() => {
      return props.category.children && props.category.children.length > 0
    })
    const toggleExpanded = () => {
      expanded.value = !expanded.value
    }

    const productCount = computed(() => {
      const countProducts = (category) => {
        const directProducts = props.products.filter(p => p.categoryId === category.id).length
        const childProducts = category.children.reduce((sum, child) => {
          return sum + countProducts(child)
        }, 0)
        return directProducts + childProducts
      }
      return countProducts(props.category)
    })

    const categoryTotal = computed(() => {
      const calculateTotal = (category) => {
        const directProducts = props.products.filter(p => p.categoryId === category.id)
        const directTotal = directProducts.reduce((sum, product) => sum + product.price, 0)
        const childTotal = category.children.reduce((sum, child) => {
          return sum + calculateTotal(child)
        }, 0)
        return directTotal + childTotal
      }
      return calculateTotal(props.category)
    })

    return {
      expanded,
      toggleExpanded,
      productCount,
      categoryTotal,
      hasChildren
    }
  }
}
</script>

<style scoped>
.summary-item {
  margin: 8px 0;
}

.summary-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.summary-header:hover {
  background: #e0e0e0;
}

.toggle-icon {
  display: inline-block;
  width: 20px;
  text-align: center;
  font-weight: bold;
  margin-right: 10px;
}

.category-name {
  flex-grow: 1;
  font-weight: 500;
}

.category-stats {
  color: #666;
  font-size: 0.9rem;
}

.children-list {
  list-style: none;
  padding-left: 30px;
  margin: 8px 0 0;
}
</style>