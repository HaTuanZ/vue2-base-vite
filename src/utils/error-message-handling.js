export async function blobTypeError(error) {
  if (
    error.request.responseType === 'blob' &&
    error.response.data instanceof Blob &&
    error.response.data.type &&
    error.response.data.type.toLowerCase().indexOf('json') != -1
  ) {
    return JSON.parse(await error.response.data.text())
  } else return { errors: {} }
}
