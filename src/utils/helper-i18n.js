import i18n from '@plugins/i18n'

export function getValueTrans(value) {
  if (value.name) {
    return value.name
  }
  if (value.text) {
    if (typeof value.text == 'string') {
      return value.text
    } else {
      return value.text[i18n.locale] || value.text[i18n.fallbackLocale]
    }
  } else if (value.trans) {
    return i18n.t(value.trans)
  }
}
