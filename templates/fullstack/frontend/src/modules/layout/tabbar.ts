import {
  Dropup,
  FullRenderingModule,
  getRouter,
  hideLoading,
  RemoteSvgIcon,
  showLoading
} from 'wok-ui'
import { ActiveMenu } from '.'
import { getExtI18n, setLang } from '../../i18n'

export class Tabbar extends FullRenderingModule {
  private i18n = getExtI18n()
  private lang = this.i18n.getLang()
  constructor(
    private readonly opts: {
      activeMenu: ActiveMenu
      onChangeLang: (lang: string) => void
    }
  ) {
    super('tabbar')
    this.render()
  }

  protected buildContent(): void {
    this.addChild(
      {
        classNames: ['item', this.opts.activeMenu === 'home' ? 'active' : ''],
        children: new RemoteSvgIcon('/icons/house-regular-full.svg'),
        onClick: () => getRouter().push('/')
      },
      {
        classNames: ['item', this.opts.activeMenu === 'about' ? 'active' : ''],
        children: new RemoteSvgIcon('/icons/info-solid-full.svg'),
        onClick: () => getRouter().push('/about')
      },
      {
        classNames: ['item', this.opts.activeMenu === 'backendInfo' ? 'active' : ''],
        children: new RemoteSvgIcon('/icons/server-solid-full.svg'),
        onClick: () => getRouter().push('/backend-info')
      },
      {
        classNames: 'item',
        children: new Dropup({
          menusAlign: 'right',
          content: new RemoteSvgIcon('/icons/language-solid-full.svg'),
          menus: [
            {
              label: 'English',
              disabled: this.lang.toLocaleLowerCase().startsWith('en'),
              callback: () => this.setLang('en')
            },
            {
              label: '中文',
              disabled: this.lang.toLocaleLowerCase().startsWith('zh'),
              callback: () => this.setLang('zh-cn')
            }
          ]
        })
      }
    )
  }
  private setLang(lang: string): void {
    showLoading()
    setLang(lang)
      .then(() => {
        this.lang = lang
        this.opts.onChangeLang(lang)
      })
      .catch(showLoading)
      .finally(hideLoading)
  }
}
