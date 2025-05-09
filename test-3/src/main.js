import { createApp } from "vue";
import { createPinia } from "pinia";
import { createApolloProvider } from "@vue/apollo-option";
import router from "@/routes/index";
import App from "./App.vue";
import { apolloClient } from "@/apollo";
import cors from "cors";


// Create Vue App
const app = createApp(App);
app.use(createPinia());
app.use(
	createApolloProvider({
		defaultClient: apolloClient,
	}),
);    
app.use(router);    
app.mount("#app");