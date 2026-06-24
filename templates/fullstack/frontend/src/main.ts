import 'wok-ui/dist/style.css'
import { initRouter } from 'wok-ui'
import { initI18n } from './i18n'
import { routerRules } from './router'

initI18n()
  .then(() => {
    initRouter({
      mode: 'hash',
      rules: routerRules
    }).mount(document.body)
  })
  .catch((error) => (document.body.textContent = error.message || 'Init failed'))
