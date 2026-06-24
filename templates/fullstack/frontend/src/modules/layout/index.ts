import {
  ResponsiveBreakPoint,
  ResponsiveModule,
  ResponsiveSize,
  Spacer,
  SubModulesOpt
} from 'wok-ui'
import { PcHeader } from './pc-header'
import { Tabbar } from './tabbar'
import './style.less'

export type ActiveMenu = 'home' | 'about' | 'backendInfo'
/**
 * 布局模块 Demo
 */
export abstract class Layout extends ResponsiveModule {
  constructor(
    private readonly _opts: {
      activeMenu: ActiveMenu
    }
  ) {
    super('app')
  }

  buildContent(sizeInfo: { respSize: ResponsiveSize; windowWidth: number }): void {
    if (sizeInfo.windowWidth <= ResponsiveBreakPoint.md) {
      // 移动端布局
      this.addChild(
        new Spacer(),
        {
          classNames: 'container',
          children: this.buildMainContent()
        },
        new Tabbar({
          activeMenu: this._opts.activeMenu,
          onChangeLang: () => this.handleLangChange()
        })
      )
    } else {
      // pc 端布局
      this.addChild(
        new PcHeader({
          activeMenu: this._opts.activeMenu,
          onChangeLang: () => this.handleLangChange()
        }),
        new Spacer('lg'),
        {
          classNames: 'container',
          children: this.buildMainContent()
        }
      )
    }
  }

  private handleLangChange() {
    this.clearCaches()
    this.render()
  }

  abstract buildMainContent(): SubModulesOpt
}
