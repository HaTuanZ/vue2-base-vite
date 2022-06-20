import { isArray } from 'lodash'

const baseURL = process.env.VITE_APP_REST_API
export function convertLinkToBackEnd(link = '') {
  if (!link) return ''
  if (link.includes('http')) {
    return link
  }
  if (link[0] == '/') link = link.substring(1)
  if (!baseURL || baseURL[0] == '/') {
    return `${window.location.origin}/${link}`
  }
  return `${baseURL}${link}`
}
export function convertJsonToQueryString(obj) {
  var str = []
  for (var p in obj)
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      let data = obj[p]
      if (isArray(data)) {
        data.forEach((item) => {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(item))
        })
      } else {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
      }
    }
  return str.join('&')
}
