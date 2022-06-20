import i18n from '@plugins/i18n'

export const passwordRegex = {
  test(string) {
    if (!/\d/.test(string)) return false
    if (!/[A-Za-z]/.test(string)) return false
    if (!/[@$!%*#?&]/.test(string)) return false
    return true
  },
}
export const isGeographicLocation = (str) => {
  if (!str) return false
  let array = str.split(',')
  if (array.length != 2) {
    array = str.split(' ')
  }
  if (array.length == 2 && !isNaN(array[0]) && !isNaN(array[1])) {
    return array
  }

  return false
}
export const isVn2000 = (lng, lat) => lng > 2000 && lat > 2000

export const rulespassword = [
  (v) =>
    !!v ||
    i18n.t('validation.requiredfield', {
      field: i18n.t('field.password'),
    }),
  (v) => (v && v.length >= 8) || i18n.t('hint.password'),
]
export default {
  required: [(v) => !!v || i18n.t('validation.required')],
  link: [(v) => !v || isURL(v) || 'Đường dẫn không hợp lệ'],
  mobile: [
    (v) => !v || /^[0-9]*$/.test(v) || 'Số điện thoại chỉ chứa số',
    (v) => !v || v.length > 9 || 'Số điện thoại không thể ít hơn 10 chữ số',
    (v) => !v || v.length < 12 || 'Số điện thoại không thể nhiều hơn 11 chữ số',
  ],
  name: [
    (v) => !!v || 'Tên hiển thị không hợp lệ',
    (v) => (!!v && v.length >= 4) || 'Tên hiển thị tối thiếu 4 kí tự',
    (v) => (!!v && v.length < 255) || 'Tên hiển thị tối đa 255 kí tự',
  ],
  username: [
    (v) => !!v || 'Tên hiển thị không hợp lệ',
    (v) => (!!v && v.length >= 4) || 'Tên hiển thị tối thiếu 4 kí tự',
    (v) => (!!v && v.length < 255) || 'Tên hiển thị tối đa 255 kí tự',
  ],
  email: [(v) => /.+@.+\..+/.test(v) || 'E-mail không hợp lệ'],
  password: rulespassword,
}
function isURL(str) {
  try {
    new URL(str)
  } catch (_) {
    return false
  }

  return true
}
