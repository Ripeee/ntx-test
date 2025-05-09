<template>
  <ul class="category-tree">
    <li v-for="category in categories" :key="category.id" class="category-item">
      <div class="category-content">
        <span>{{ category.name }}</span>
        <div class="category-actions">
          <button @click="$emit('edit', category)" class="btn btn-sm btn-edit">Edit</button>
          <button @click="$emit('delete', category.id)" class="btn btn-sm btn-delete">Delete</button>
        </div>
      </div>
      <CategoryTree 
        v-if="category.children.length > 0" 
        :categories="category.children" 
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </li>
  </ul>
</template>

<script>
export default {
  name: 'CategoryTree',
  props: {
    categories: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.category-tree {
  list-style: none;
  padding-left: 20px;
  margin: 0;
}

.category-item {
  margin: 8px 0;
  position: relative;
}

.category-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #4CAF50;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.btn-edit {
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-delete {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
</style>