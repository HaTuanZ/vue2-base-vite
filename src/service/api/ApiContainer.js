const defaultPagination = {
  page: 1,
  itemsPerPage: 10,
  total: 0,
  hasMoreItems: true,
};
class Api {
  constructor(api, handle) {
    this.api = api;
    this.handle = handle;
  }
  list(params, option = {}) {
    params = this.getConvertParam(params);
    return this.api.list(params, option);
  }
  getConvertParam(
    params,
    { filter = true, orderBy = true, pagination = true } = {}
  ) {
    let defaultParams = {};
    if (filter) defaultParams.filters = this.handle.filters;
    if (orderBy) defaultParams.orderBys = this.handle.orderBys;
    if (pagination) defaultParams.pagination = this.handle.pagination;
    return { ...this.handle.convertParam(defaultParams), ...params };
  }
  setHandle({ orderBys, filters, pagination }) {
    if (filters) this.handle.setFilters(filters);
    if (orderBys) this.handle.setOrderBys(orderBys);
    if (pagination) this.handle.setPagination(pagination);
  }
  updateHandle({ orderBys, filters, pagination } = {}) {
    if (filters) this.handle.updateFilters(filters);
    if (orderBys) this.handle.updateOrderBys(orderBys);
    if (pagination) this.handle.updatePagination(pagination);
  }
  __noSuchMethod__(name, args) {
    return this.api[name](...args);
  }
}

export class ApiHandleParams {
  isPaginate() {
    this.paginate = true;
  }
  constructor({
    orderBys = [],
    filters = [],
    pagination = {
      page: 1,
      itemsPerPage: 10,
      total: 0,
      hasMoreItems: true,
    },
  } = {}) {
    this.orderBys = orderBys;
    this.filters = filters;
    this.pagination = Object.assign(pagination, defaultPagination);
  }
  convertParam({ orderBys, filters, pagination }) {
    let data_return = {
      ...this.convertPagination(pagination),
    };

    if (orderBys && orderBys.length > 0) {
      data_return.sort = this.convertSort(orderBys);
    }
    if (filters && filters.length > 0) {
      data_return.filters = this.convertFilters(filters);
    }

    return data_return;
  }
  getOption() {
    return {
      filters: this.filters,
      orderBys: this.orderBys,
      pagination: this.pagination,
    };
  }
  getFilters() {
    return this.filters;
  }
  getOrderBys() {
    return this.orderBys;
  }
  getPagination() {
    return this.pagination;
  }
  setFilters(filters) {
    this.filters = filters;
    this.pagination.page = 1;
    return this;
  }
  setPagination(pagination) {
    this.pagination = pagination;
    return this;
  }
  setOrderBys(orderBys) {
    this.orderBys = [];
    this.updateOrderBys(orderBys);
    return this;
  }
  updateOrderBys(orderBys) {
    const c_orderBys = this.orderBys.slice() || [];
    orderBys.forEach((orderBy) => {
      let index = c_orderBys.findIndex(
        (x) => x.field.value == orderBy.field.value
      );
      if (!orderBy.sort) {
        orderBy.sort = "asc";
      }
      if (index < 0) {
        c_orderBys.push(orderBy);
      } else {
        c_orderBys[index] = orderBy;
      }
    });
    this.orderBys = c_orderBys;
    return this;
  }
  updateFilters(filters) {
    this.filters = this.filters.concat(filters);
    this.pagination.page = 1;
    return this;
  }
  updatePagination(pagination) {
    this.pagination = Object.assign(this.pagination, pagination);
    return this;
  }
  convertPagination(pagination) {
    if (!this.paginate || !pagination) {
      return {};
    }
    return {
      paginate: true,
      page: pagination.page,
      itemsPerPage: pagination.itemsPerPage,
    };
  }
  convertSort(orderBys = []) {
    return orderBys
      .map(
        (x) =>
          `${x.sort === "desc" ? "-" : ""}${
            typeof x.field.sortable == "string"
              ? x.field.sortable
              : x.field.value
          }`
      )
      .join(",");
  }
  convertFilters(filters = []) {
    return filters
      .map((x) => `${x.field.value}:${x.search.value || x.search}`)
      .join(",");
  }

  convertData(data) {
    let items = data || [];
    let pagination = {
      page: 1,
      itemsPerPage: 10,
      total: items.length,
      hasMoreItems: false,
    };
    if (this.paginate) {
      items = data.list;
      pagination = data.pagination;
    } else {
      if (data.data) items = data.data;
      pagination = {
        page: 1,
        itemsPerPage: 10,
        total: items.length,
        hasMoreItems: false,
      };
    }
    return { items, pagination };
  }
  reconvertSort(sort = "", headers = []) {
    if (!sort || !headers || headers.length < 1) return [];
    let orderBys = sort.split(",").reduce((acc, cur) => {
      let key = cur.replace("-", "");
      let sort = {
        sort: cur[0] == "-" ? "desc" : "asc",
        field: headers.find((x) => {
          let code = typeof x.sortable == "string" ? x.sortable : x.value;
          return code == key;
        }),
      };
      if (sort.field) {
        acc.push(sort);
      }
      return acc;
    }, []);
    return orderBys;
  }
  reconvertFilters(filterStr = "", headers = []) {
    if (!filterStr || !headers || headers.length < 1) return [];
    let filters = filterStr.split(",").reduce((acc, cur) => {
      let [key, value] = cur.split(":");
      let filter = {
        value,
        field: headers.find((x) => {
          let code = typeof x.filterable == "string" ? x.filterable : x.value;
          return code == key;
        }),
      };
      if (filter.field) {
        acc.push(filter);
      }
      return acc;
    }, []);
    return filters;
  }
  reconvertParams(params, headers) {
    let orderBys = this.reconvertSort(params.sort, headers);
    let filters = this.reconvertFilters(params.filters, headers);
    return { orderBys, filters };
  }
}

function ApiContainer() {
  return enableNoSuchMethod(new Api(...arguments));
}
function enableNoSuchMethod(obj) {
  return new Proxy(obj, {
    get(target, p) {
      if (p in target) {
        return target[p];
      } else if (typeof target.__noSuchMethod__ == "function") {
        return function (...args) {
          return target.__noSuchMethod__.call(target, p, args);
        };
      }
    },
  });
}
export function createApi({ api, handle }) {
  return new ApiContainer(api, handle);
}
export default ApiContainer;
