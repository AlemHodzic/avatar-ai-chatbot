import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.config.globalProperties.state = {}

app.use(createPinia())
app.use(router)



if (import.meta.env.NODE_ENV === 'production') {
    app.use(epxress.static(`${__dirname}/public`))
}

app.mount('#app')
