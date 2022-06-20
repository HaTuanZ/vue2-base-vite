export default {
  namespaced: true,
  state: {
    //history,breadcrumb
    typeExtension: "breadcrumb"
  },
  getters: {
    typeExtension: (state) => state.typeExtension || "breadcrumb"
  },
  mutations: {
    changeTypeExtension(state, typeExtension) {
      state.typeExtension = typeExtension;
    }
  },
  actions: {}
};
