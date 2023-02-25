import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import VWindowResize from './common/directives/v-window-resize';

const app = createApp(App);

VWindowResize(app);

app.mount('#app')
