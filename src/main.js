import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

//Router
import router from './router'
app.use(router)

// Naive ui
import naive from 'naive-ui'
app.use(naive)

//Vue flow
import "@vue-flow/core/dist/style.css"
import "@vue-flow/core/dist/theme-default.css"
import { VueFlow } from '@vue-flow/core'
app.use(VueFlow)

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:4523/m1/4704421-4356475-default';

app.mount('#app')





