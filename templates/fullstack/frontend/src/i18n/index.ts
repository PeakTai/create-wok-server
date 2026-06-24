import { getI18n, I18n } from 'wok-ui'
import { ExtI18n } from './ext-i18n'
import { en } from './en'
import { zh } from './zh'

function getLocalLang() {
  return localStorage.getItem('lang') || navigator.language || 'en'
}

export async function setLang(lang: string) {
  localStorage.setItem('lang', lang)
  await getI18n().setLang(lang)
}

let extI18n: I18n<ExtI18n> | undefined

export async function initI18n() {
  const i18n = getI18n()
  extI18n = i18n.extend<ExtI18n>(en)
  extI18n.setMsgs('zh-cn', zh)
  await i18n.setLang(getLocalLang())
}

export function getExtI18n() {
  if (!extI18n) {
    throw new Error('Invoke initI18n first to get extI18n')
  }
  return extI18n
}
