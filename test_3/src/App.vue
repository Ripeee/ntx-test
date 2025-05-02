<script setup>
import { useCounterStore } from './stores/counter'
import Map from './components/Map.vue'
const counter = useCounterStore()
</script> 

<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>
  
  
  <div class="">
    <h1 class="text-xl font-bold">Counter: {{ counter.count }}</h1>
    <p>Double Count: {{ counter.doubleCount }}</p>
    <button @click="counter.increment" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
      Increment
    </button> 
  </div>
   -->
  <Map />

</template>

<script>
const query = `
  query {
    locations {
      id
      name
      latitude
      longitude
    }
  }
`;

fetch("https://sirefcode.hasura.app/v1/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hasura-admin-secret": "jw8y3lwW7Vk4HKuROjlbs3flnrYaDsE1vkqNqhtTgv3rIo8bC655Fx6WmSZk4KvO",
  },
  body: JSON.stringify({ query }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("✅ Data GraphQL:", data.data);
  })
  .catch((err) => console.error("❌ Error GraphQL:", err));
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
