import { App } from 'vue'

import { pinia } from '@/plugins/pinia.ts'
import router from '@/router'
import Toast from 'vue-toastification'

//Toast Notification
const options = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
}

export function registerPlugins(app: App): void {
  app.use(Toast, options)

  app.use(router).use(pinia)
}
