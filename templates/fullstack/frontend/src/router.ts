import { RouterRule } from 'wok-ui'
import { HomePage } from './pages/home-page'

/**
 * 路由规则
 */
export const routerRules: RouterRule[] = [
  {
    path: '/',
    module: () => new HomePage()
  },
  {
    path: '/about',
    // 运行时动态导入页面模块
    module: () => import('./pages/about').then((mod) => new mod.AboutPage())
  },
  {
    path: '/backend-info',
    module: () => import('./pages/backend-info').then((mod) => new mod.BackendInfoPage())
  }
]
