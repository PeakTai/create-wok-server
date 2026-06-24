import { SubModulesOpt, H1, Spacer, Text, VBox, showLoading, hideLoading, showWarning, rem } from 'wok-ui'
import { Layout } from '../modules'
import { getExtI18n } from '../i18n'
import { fetchAppInfo, AppInfo } from '../api'

export class BackendInfoPage extends Layout {
  private info?: AppInfo

  constructor() {
    super({
      activeMenu: 'backendInfo'
    })
    this.render()
    this.loadBackendData()
  }

  loadBackendData() {
    showLoading()
    fetchAppInfo()
      .then((res) => {
        this.info = res
      })
      .catch(showWarning)
      .finally(() => {
        hideLoading()
        this.render()
      })
  }

  buildMainContent(): SubModulesOpt {
    const i18n = getExtI18n()
    return [
      new H1(i18n.buildMsg('backendInfo')),
      new Spacer('lg'),
      new VBox({
        gap: rem(1),
        children: [
          new Text(`${i18n.buildMsg('appName')}: ${this.info?.appName || 'N/A'}`),
          new Text(`${i18n.buildMsg('version')}: ${this.info?.version || 'N/A'}`),
          new Text(`${i18n.buildMsg('startAt')}: ${this.info?.startAt || 'N/A'}`),
          new Text(`${i18n.buildMsg('env')}: ${this.info?.env || 'N/A'}`)
        ]
      })
    ]
  }
}
