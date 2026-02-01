import { createApp } from 'vue';
import App from './App.vue';
import _preload from '@/game/preload';
import './index.css';

// init Vue
export const app = createApp(App);
app.mount('#app');
