import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import App from './App.vue'
import router from './router'
import { getInitialThemeState, syncTheme } from './theme.ts'

syncTheme(getInitialThemeState())

const app = createApp(App)
app.use(PrimeVue)
app.use(ToastService)
app.use(router)
app.mount('#app')
