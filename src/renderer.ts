import { createApp } from 'vue';
import App from './App.vue';
import _preload from '@/game/preload';
import router from './ui/router';
import './index.css';

// init Vue
export const app = createApp(App);
router.replace({ path: '/' });
app.use(router);
app.mount('#app');
