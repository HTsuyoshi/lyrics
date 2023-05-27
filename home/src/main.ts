import { createApp } from 'vue'
import './style.css'
import App from './pages/App.vue'
import router from './router'

const app = createApp(App);

app.use(router).mount('#app');

app.config.errorHandler = (err, instance, info) => {
	console.log(err);
	console.log(instance);
	console.log(info);
};
