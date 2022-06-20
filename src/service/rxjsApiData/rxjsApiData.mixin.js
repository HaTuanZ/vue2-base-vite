import { ApiHandleParams } from '../api/ApiContainer'
import { RxjsApiData } from './rxjsApiData'
import { createApi } from '@api'
import { debounce } from '@utils'

export const rxjsApiMixin = {
  data: () => ({
    mixinRxjsApiData_subscriptions: {},
    rxjxApiClass: null,
    mixinRxjsApiData_id: null,
    items: [],
    filters: [],
    orderBys: [],
    pagination: {},
    params: { search: '' },
    loading: false,
    default_params: {},
  }),
  watch: {
    params: {
      handler: debounce(function(newVal) {
        this.pagination.page = 1
        this.getData()
      }, 400),
      deep: true,
    },
  },
  provide() {
    return {
      rxjsOption: {
        isScrollLoad: this.isScrollLoad,
        isPagination: this.isPagination,
      },
    }
  },
  computed: {
    isScrollLoad() {
      return false
    },
    isPagination() {
      return true
    },
  },
  destroyed() {
    this.mixinRxjsApiData_onDestroy()
    if (this.mixinRxjsApiData_id) delete cache_api[this.mixinRxjsApiData_id]
  },
  beforeRouteLeave(to, from, next) {
    this.mixinRxjsApiData_onDestroy()
    next()
  },
  methods: {
    onResetFilter() {
      this.pagination.page = 1
      this.params = {}
    },
    mixinRxjsApiData_onDestroy() {
      let subscriptions = ['$data', '$loading', '$option']
      subscriptions.forEach((subscription) => {
        if (this.mixinRxjsApiData_subscriptions[subscription]) {
          this.mixinRxjsApiData_subscriptions[subscription].unsubscribe()
          this.mixinRxjsApiData_subscriptions[subscription] = null
        }
      })
      this.rxjxApiClass = null
    },
    mixinRxjsApiData_init({
      api,
      handle = new ApiHandleParams(),
      id = '',
      option = {},
    } = {}) {
      option = Object.assign(
        { isScrollLoad: this.isScrollLoad, isPagination: this.isPagination },
        option
      )
      this.mixinRxjsApiData_id = id
      let ApiContainer = createApi({ api, handle })
      // if (this.mixinRxjsApiData_id && !cache_api[this.mixinRxjsApiData_id]) {
      //   cache_api[this.mixinRxjsApiData_id] = ApiContainer
      // }
      this.rxjxApiClass = new RxjsApiData(ApiContainer, option)

      this.mixinRxjsApiData_subscriptions.$data = this.rxjxApiClass.$data.subscribe(
        (items) => {
          this.items = items
        }
      )
      this.mixinRxjsApiData_subscriptions.$loading = this.rxjxApiClass.$loading.subscribe(
        (loading) => {
          this.loading = loading
        }
      )
      this.mixinRxjsApiData_subscriptions.$option = this.rxjxApiClass.$option.subscribe(
        ({ filters, orderBys, pagination }) => {
          this.filters = filters
          this.orderBys = orderBys
          this.pagination = pagination
        }
      )
      this.getData()
    },
    convertParams(params) {
      return params
    },
    updatePagination(pagination) {
      this.rxjxApiClass.updateOption({
        pagination,
      })
      this.getData()
    },
    updateOption({ filters, orderBys } = {}) {
      this.rxjxApiClass.updateOption({
        filters,
        orderBys,
        pagination: { page: 1 },
      })
      this.getData()
    },
    setOption({ filters, orderBys }) {
      this.rxjxApiClass.setOption({
        filters,
        orderBys,
        pagination: { page: 1 },
      })
      this.getData()
    },

    getData(filter = {}) {
      this.rxjxApiClass.getData(
        {
          ...this.default_params,
          ...this.params,
          ...filter,
        },
        { headers: { isCancelToken: true } }
      )
    },
    onLoadMore() {
      if (this.loading) return
      if (!this.isPagination) return
      if (this.isScrollLoad && this.rxjxApiClass.pagination.hasMoreItems) {
        let page =
          this.items.length > 0 ? this.rxjxApiClass.pagination.page + 1 : 1
        this.rxjxApiClass.updateOption({ pagination: { page } })
      }
      this.getData(this.params)
    },
    onReload() {
      this.updateOption()
    },
    onReset() {
      this.rxjxApiClass.reset()
      this.$forceUpdate()
      this.getData()
    },
    convertParam(params) {
      params = this.rxjxApiClass.api.getConvertParam(params, {
        filter: true,
        orderBy: true,
        pagination: false,
      })
      return params
    },
    onClickHeader(header) {
      if (!header || !header.sortable) {
        return
      }
      this.rxjxApiClass.updateOrderBys([{ field: header }])
      this.getData()
    },
    onUpdateOrderBys(orderBys) {
      if (!this.rxjxApiClass) return
      this.rxjxApiClass.setOption({
        orderBys,
        pagination: {
          page: this.isScrollLoad ? 1 : this.pagination.page,
        },
      })
      this.getData()
    },
  },
}
let cache_api = {}
