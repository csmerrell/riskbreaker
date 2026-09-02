import { createApp } from 'vue';
import App from './clairescott.dev/App.vue';
import './index.css';
import { usePlatform } from './usePlatform.js';

const { isWeb } = usePlatform();
isWeb.value = true;

// init Vue
export const app = createApp(App);
app.mount('#app');
