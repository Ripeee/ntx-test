import { createApp, provide } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./routes/index"; // Impor router
import { apolloClient } from "./api/graphql"; // Impor apolloClient
import { DefaultApolloClient } from "@vue/apollo-composable"; // Untuk provide apollo client

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router); // Gunakan router

// Provide apollo client
app.provide(DefaultApolloClient, apolloClient);

app.mount("#app");
