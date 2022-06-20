import proj4 from 'proj4'

export const CRS = window.config.CRS || {}
CRS['EPSG:3405'] =
  '+proj=utm +zone=48 +ellps=WGS84 +towgs84=-192.873,-39.382,-111.202,-0.00205,-0.0005,0.00335,0.0188 +units=m +no_defs'

Object.keys(CRS).forEach((name) => {
  proj4.defs(name, CRS[name])
})

export const toVn2000 = (lat, lng) => {
  return proj4('EPSG:4326', 'EPSG:3405', [parseFloat(lng), parseFloat(lat)])
}

export const vn2000To4326 = (lat, lng) => {
  return proj4('EPSG:3405', 'EPSG:4326', [parseFloat(lng), parseFloat(lat)])
}
export function deg_to_dms(deg) {
  var d = Math.floor(deg)
  var minfloat = (deg - d) * 60
  var m = Math.floor(minfloat)
  var secfloat = (minfloat - m) * 60
  var s = Math.round(secfloat)
  // After rounding, the seconds might become 60. These two
  // if-tests are not necessary if no rounding is done.
  if (s == 60) {
    m++
    s = 0
  }
  if (m == 60) {
    d++
    m = 0
  }
  return { deg: d, min: m, sec: s }
}
export function dms_to_des({ deg, min, sec } = {}) {
  let result = (Number(deg) + Number(min) / 60 + Number(sec) / 3600).toFixed(6)
  return result
}
export function deg_to_dms_string(str) {
  let { deg, min, sec } = deg_to_dms(str)

  return (
    deg +
    '° ' +
    (min + '').padStart(2, '0') +
    '′ ' +
    (sec + '').padStart(2, '0') +
    '″'
  )
}
export const latDMS = (lat) => {
  return `${dcToDeg(lat)}° ${dcToMin(lat)}' ${parseFloat(
    dcToSec(lat).toFixed(3)
  )}" ${lat > 0 ? 'N' : 'S'}`
}

export const lngDMS = (lng) => {
  return `${dcToDeg(lng)}° ${dcToMin(lng)}' ${parseFloat(
    dcToSec(lng).toFixed(3)
  )}" ${lng > 0 ? 'E' : 'W'}`
}

const dcToDeg = (val) => {
  if (val === 0) {
    return 0
  }
  return Math.floor(Math.abs(val))
}

const dcToMin = (val) => {
  if (val === 0) {
    return 0
  }
  return Math.floor((Math.abs(val) - Math.floor(Math.abs(val))) * 60)
}

const dcToSec = (val) => {
  if (val === 0) {
    return 0
  }
  return (Math.abs(val) - dcToDeg(val) - dcToMin(val) / 60) * 3600
}
