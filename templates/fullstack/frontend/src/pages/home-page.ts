import { SubModulesOpt, H1, Spacer } from 'wok-ui'
import { Layout } from '../modules'
import { getExtI18n } from '../i18n'

export class HomePage extends Layout {
  constructor() {
    super({
      activeMenu: 'home'
    })
    this.render()
  }

  buildMainContent(): SubModulesOpt {
    const i18n = getExtI18n()
    return [new H1(i18n.buildMsg('wokuiFramework')), new Spacer('lg'), i18n.buildMsg('wokuiFrameworkDesc')]
  }
}
