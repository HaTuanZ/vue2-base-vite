import { merge } from 'lodash'
import { Subject } from 'rxjs'

const defaultPagination = {
  "page": 1,
  "itemsPerPage": 10,
  "total": 0,
  "hasMoreItems": true
}
import {
  copyByJson,
  getUUIDv4,
} from '@utils'

export class RxjsApiData {
  /**
   * @private
   */
  _defaultParams = {}
  /**
   * @private
   */
  _itemIds = []
  /**
   * @private
   */
  _itemObjects = {}
  /**
   * @private
   */
  _$loading = new Subject()
  /**
   * @private
   */
  _$option = new Subject()
  /**
   * @private
   */
  _$data = new Subject()
  /**
   * @typedef {object}
   * @property {boolean} isScrollLoad is use scroll load
   * @property {boolean} isPagination is use pagination
   * @private
   */
  _option = {}
  /**
   * @param {Api} api
   * @param {object} object
   * @param {boolean?} object.isScrollLoad
   * @param {boolean?} object.isPagination
   */
  constructor(api, { isScrollLoad = false, isPagination = false } = {}) {
    this.api = api
    this._option = { isScrollLoad, isPagination }
    this.filters = []
    this.orderBys = []
    if (isPagination) {
      this.api.handle.isPaginate()
    }
    this.pagination = copyByJson(defaultPagination)
    this.pagination.paginate = isPagination
    this.api.updateHandle({
      filters: this.filters,
      orderBys: this.orderBys,
      pagination: this.pagination,
    })
  }
  get option() {
    return this._option
  }
  get $data() {
    return this._$data.asObservable()
  }
  get $loading() {
    return this._$loading.asObservable()
  }
  get $option() {
    return this._$option.asObservable()
  }
  set loading(value = false) {
    this._$loading.next(value)
  }
  updateOrderBys(orderBys) {
    this.updateOption({ orderBys })
  }
  updateOption({ filters, orderBys, pagination }) {
    pagination = Object.assign({}, this.pagination, pagination)
    this.api.updateHandle({ filters, orderBys, pagination })
    this._$option.next(this.api.handle.getOption())
  }
  setOption({ filters, orderBys, pagination }) {
    pagination = Object.assign({}, this.pagination, pagination)
    this.api.setHandle({ filters, orderBys, pagination })
    this._$option.next(this.api.handle.getOption())
  }
  setDefaultParams(params) {
    this._defaultParams = params
  }
  reset() {
    this.setOption({
      filters: [],
      orderBys: [],
      pagination: { page: 0 },
    })
  }
  getData(params, options = {}) {
    this.loading = true
    params = merge(params, this._defaultParams, {
      paginate: this._option.isPagination,
    })
    this.api
      .list(params, options)
      .then((res) => {
        if (res.error) return
        const { data } = res
        let items = data || []
        if (this._option.isPagination) {
          items = data.list
          this.pagination = data.pagination
        } else {
          if (data.data) items = data.data
          this.pagination = {
            page: 1,
            itemsPerPage: 10,
            total: items.length,
            hasMoreItems: false,
          }
        }
        if (
          (this.pagination && this.pagination.page == 1) ||
          !this._option.isScrollLoad
        ) {
          this._itemIds = []
          this._itemObjects = {}
        }
        this.setOption({ pagination: this.pagination })

        items.forEach((item) => {
          if (!item.id) {
            item.id = getUUIDv4()
          }
          if (this._option.isScrollLoad) {
            if (!this._itemIds.includes(item.id)) this._itemIds.push(item.id)
            this._itemObjects[item.id] = item
          } else {
            this._itemIds.push(item.id)
            this._itemObjects[item.id] = item
          }
        })

        this._$data.next(this._itemIds.map((id) => this._itemObjects[id]))
      })
      .finally(() => {
        this.loading = false
      })
  }
}
