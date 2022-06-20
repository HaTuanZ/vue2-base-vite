import { isNil } from 'lodash'

function JsonToFormData(data) {
  let formData = new FormData()
  Object.keys(data).forEach((key) => {
    if (isNil(data[key])) {
      return
    }
    if (data[key] instanceof File) {
      formData.append(key, data[key])
    } else if (Array.isArray(data[key])) {
      data[key].forEach((item) => {
        formData.append(key + '[]', item)
      })
    } else if (typeof data[key] == 'object') {
      formData.append(key, JSON.stringify(data[key]))
    } else {
      formData.append(key, data[key])
    }
  })

  return formData
}

function checkNull(value) {
  return (
    ['null', 'undefined'].includes(typeof value) ||
    value === null ||
    value.length == 0
  )
}

function JsonToFormDataV2(object) {
  var form_data = new FormData()
  for (var key in object) {
    form_data = handleFormData(form_data, object[key], key, null)
  }
  return form_data
}

function handleFormData(
  formData = new FormData(),
  value,
  key,
  keyArrayObject = null
) {
  if (checkArray(value)) {
    value.forEach((element, index) => {
      let key_in = `${key}[${index}]`
      formData = hasKeyArrayObject(formData, element, key_in, keyArrayObject)
    })
    if (value.length == 0) {
      formData.append(key, [])
    }
  } else if (checkObject(value)) {
    Object.keys(value).forEach((e_key) => {
      formData = hasKeyArrayObject(
        formData,
        value[e_key],
        `${key}[${e_key}]`,
        keyArrayObject
      )
    })
  } else if (checkNotEmpty(value)) {
    formData.append(key, value)
  }
  return formData
}

function checkNotEmpty(value) {
  return value || value == 0
}
function checkObject(value) {
  return typeof value === 'object' && value !== null && !(value instanceof File)
}
function checkFile(value) {
  return value instanceof File
}
function checkArray(value) {
  return Array.isArray(value)
}
function hasKeyArrayObject(formData, value, key, keyArrayObject) {
  if (keyArrayObject) {
    formData = handleFormData(
      formData,
      value[keyArrayObject],
      key,
      keyArrayObject
    )
  }
  formData = handleFormData(formData, value, key, keyArrayObject)
  return formData
}

export { JsonToFormData, JsonToFormDataV2 }
export default JsonToFormData
