export function copyByJson(object) {
  return JSON.parse(JSON.stringify(object))
}

export function getRandomColor() {
  var colors = ['#ffebee', '#e8eaf6', '#f3e5f5', '#eee', '#e3f2fd', '#e3f2fd']
  const index = Math.floor(Math.random() * 6)
  return colors[index]
}

function deepObj(obj, keys, value) {
  let i = 0
  for (; i < keys.length - 1; i++) {
    let key = keys[i]

    if (!obj[key]) {
      //obj[key] = {}; comment chỗ này
      if (keys[i + 1].match(/^\d+$/)) {
        obj[key] = []
      } else {
        obj[key] = {}
      }
    }

    obj = obj[key]
  }

  obj[keys[i]] = value
}

export function getChartColor(index) {
  return colorChart[index]
}
export function getChartRandomColor() {
  const random = Math.floor(Math.random() * colorChart.length)
  return colorChart[random]
}
const colorChart = [
  '#0E9F6E',
  '#84A2AE',
  '#BAC9CF',
  '#D7E3E8',
  '#EBF1F3',
  '#da251d',
  '#ffbd99',
  '#ffa07f',
  '#ff8365',
  '#ff664c',
  '#fb4834',
  '#b90004',
  '#9a0000',
  '#7c0000',
  '#600000',
  '#25CCF7',
  '#FD7272',
  '#54a0ff',
  '#00d2d3',
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#16a085',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
  '#2c3e50',
  '#f1c40f',
  '#e67e22',
  '#e74c3c',
  '#ecf0f1',
  '#95a5a6',
  '#f39c12',
  '#d35400',
  '#c0392b',
  '#bdc3c7',
  '#7f8c8d',
  '#55efc4',
  '#81ecec',
  '#74b9ff',
  '#a29bfe',
  '#dfe6e9',
  '#00b894',
  '#00cec9',
  '#0984e3',
  '#6c5ce7',
  '#ffeaa7',
  '#fab1a0',
  '#ff7675',
  '#fd79a8',
  '#fdcb6e',
  '#e17055',
  '#d63031',
  '#feca57',
  '#5f27cd',
  '#54a0ff',
  '#01a3a4',
]

export const getUUIDv4 = function () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  )
}

// If there's a replacement for the key {key} in template, return that replacement or empty string`
export function replaceLink(template = '', replacements = {}) {
  return template.replace(/{([^}]+)}/g, (match, key) => {
    return replacements[key] || ''
  })
}
export function round(num) {
  var m = Number((Math.abs(num) * 100).toPrecision(15))
  return (Math.round(m) / 100) * Math.sign(num)
}
export function encodeData(data) {
  return Object.keys(data)
    .map(function (key) {
      return [key, data[key]].join('=')
    })
    .join('&')
}
export function createToSlug(ten) {
  var slug
  slug = ten.toLowerCase()
  slug = slug.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a')
  slug = slug.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e')
  slug = slug.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i')
  slug = slug.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o')
  slug = slug.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u')
  slug = slug.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y')
  slug = slug.replace(/(đ)/g, 'd')
  slug = slug.replace(/([^0-9a-z-\s])/g, '')
  slug = slug.replace(/(\s+)/g, '-')
  slug = slug.replace(/^-+/g, '')
  slug = slug.replace(/-+$/g, '')
  return slug
}
