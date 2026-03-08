import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './styles.css';
import router from './router';
import { i18n, setDocumentDirection } from './i18n';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
setDocumentDirection(i18n.global.locale.value);
app.mount('#app');
