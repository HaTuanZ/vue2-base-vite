import Vue from 'vue'

import VueI18n from 'vue-i18n'

import en from '@lang/en'

Vue.use(VueI18n)
const dateTimeFormats = {
  en: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
    time: {
      hour: 'numeric',
      minute: 'numeric',
    },
  },
  vi: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
    time: {
      hour: 'numeric',
      minute: 'numeric',
    },
  },
}
const messages = { en }
const i18n = new VueI18n({
  locale: 'en', // set locale
  messages,
  fallbackLocale: 'en',
  dateTimeFormats,
})
export default i18n
const loadedLanguages = ['en']
export function loadLanguageAsync(lang) {
  // If the same language
  if (i18n.locale === lang) {
    return Promise.resolve(setI18nLanguage(lang))
  }

  // If the language was already loaded
  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang))
  }

  // If the language hasn't been loaded yet
  return import(`../lang/${lang}/index.js`).then(
    (messages) => {
      i18n.setLocaleMessage(lang, messages.default)
      loadedLanguages.push(lang)
      return setI18nLanguage(lang)
    }
  )
}

function setI18nLanguage(lang) {
  i18n.locale = lang
  localStorage.setItem('locale', lang)
  document.querySelector('html').setAttribute('lang', lang)

  return lang
}

export function checkCurrentLang() {
  const currentLang = localStorage.getItem('locale') || 'en'
  loadLanguageAsync(currentLang)
}
