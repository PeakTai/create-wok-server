import { H1, Spacer, SubModulesOpt } from 'wok-ui'
import { getExtI18n } from '../i18n'
import { Layout } from '../modules'

export class AboutPage extends Layout {
  constructor() {
    super({
      activeMenu: 'about'
    })
    this.render()
  }

  buildMainContent(): SubModulesOpt {
    const i18n = getExtI18n()
    return [new H1(i18n.buildMsg('aboutUs')), new Spacer('lg'), i18n.buildMsg('aboutUsPage')]
  }
}
