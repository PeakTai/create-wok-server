import {
  Dropdown,
  FullRenderingModule,
  getRouter,
  hideLoading,
  RemoteSvgIcon,
  showLoading
} from 'wok-ui'
import { ActiveMenu } from '.'
import { getExtI18n, setLang } from '../../i18n'

export class PcHeader extends FullRenderingModule {
  private i18n = getExtI18n()
  private lang = this.i18n.getLang()

  constructor(
    private readonly opts: {
      activeMenu: ActiveMenu
      onChangeLang: (lang: string) => void
    }
  ) {
    super('header')
    this.render()
  }

  protected buildContent(): void {
    this.addChild({
      classNames: 'container',
      children: [
        { classNames: 'logo', innerHTML: 'wok-ui' },
        {
          classNames: 'menu',
          children: [
            {
              classNames: ['item', this.opts.activeMenu === 'home' ? 'active' : ''],
              innerHTML: this.i18n.buildMsg('home'),
              onClick: () => getRouter().push('/')
            },
            {
              classNames: ['item', this.opts.activeMenu === 'about' ? 'active' : ''],
              innerHTML: this.i18n.buildMsg('aboutUs'),
              onClick: () => getRouter().push('/about')
            },
            {
              classNames: ['item', this.opts.activeMenu === 'backendInfo' ? 'active' : ''],
              innerHTML: this.i18n.buildMsg('backendInfo'),
              onClick: () => getRouter().push('/backend-info')
            }
          ]
        },
        {
          classNames: 'language',
          children: new Dropdown({
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
      ]
    })
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
