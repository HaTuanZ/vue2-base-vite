export const FILE_ICON = {
  excel: 'mdi-file-excel-outline',
  pdf: 'mdi-file-document-outline',
  word: 'mdi-file-word-outline',
  image: 'mdi-file-image',
  video: 'mdi-file-video',
  music: 'mdi-file-music',
  audio: 'mdi-file-music',
  default: 'mdi-file-outline',
  shapefile: 'mdi-file-image-marker-outline',
}
export function getIcon(type) {
  return FILE_ICON[type] || FILE_ICON.default
}
