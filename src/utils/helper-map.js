import bbox from '@turf/bbox'

export function fitBounds(map, value) {
  if (!value || !value.type || !map) return
  if (['Point'].includes(value.type)) {
    map.flyTo({
      center: value.coordinates,
      zoom: 14,
      duration: 0,
    })
    return
  }
  let bboxFil = undefined
  if (['Feature', 'FeatureCollection'].includes(value.type)) {
    bboxFil = bbox(value)
  } else {
    bboxFil = bbox({
      type: 'Feature',
      properties: {},
      geometry: value,
    })
  }

  if (bboxFil)
    map.fitBounds(bboxFil, {
      padding: 20,
      duration: 0,
    })
}
