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

//cookie
import VueCookies from 'vue-cookies'
app.use(VueCookies, { expires: '7d'})

//Vue flow
import "@vue-flow/core/dist/style.css"
import "@vue-flow/core/dist/theme-default.css"

//Axios
import axios from 'axios'
axios.defaults.baseURL = 'http://172.16.3.72:5000/';
axios.defaults.withCredentials = true;

app.mount('#app')





