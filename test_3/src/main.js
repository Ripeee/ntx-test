import './assets/main.css'
import "leaflet/dist/leaflet.css";
import "vue-map-ui/dist/normalize.css";
import "vue-map-ui/dist/style.css";
import "vue-map-ui/dist/theme-all.css";
// import "vue-map-ui/dist/vue-map-ui.css";
import { createApp, h } from "vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from "./apollo";
import { createPinia } from 'pinia'
import App from './App.vue'
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// const app = createApp(App)

// app.use(createPinia())

// app.mount('#app')   

createApp({
	setup() {
		return {
			[DefaultApolloClient]: apolloClient,
		};
	},
	render: () => h(App),
}).use(createPinia()).mount("#app");