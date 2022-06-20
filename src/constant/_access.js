import { get } from 'lodash'

export const CAN_ACCESS = {
  user: {
    create: (item, user) => user.hasPermission('user-management'),
    update: (item, user) => user.hasPermission('user-management'),
    delete: (item, user) => item.id != user.id && user.isAdmin,
    changePassword: (item, user) => item.id == user.id || user.isAdmin,
  },
  dataset: {
    create: (item, user) => user.isAdmin,
    update: (item, user) => true,
    delete: (item, user) => true,
  },
  dataset_document: {
    delete: (item, user) => item?.created_by?.id == user.id || user.isAdmin,
  },
  dataset_feature: {
    create: (item, user) => true,
    update: (item, user) => true,
    delete: (item, user) => true,
  },
}
export function checkAccess(permission, user, data) {
  let access = get(CAN_ACCESS, permission, () => false)
  return access(data, user)
}
