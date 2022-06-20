export function sync(store, router) {
  const moduleName = "route";

  store.registerModule(moduleName, {
    namespaced: true,
    state: cloneRoute(router.currentRoute),
    mutations: {
      ROUTE_CHANGED(state, transition) {
        store.state[moduleName] = cloneRoute(
          transition.to,
          transition.requiresAuth
        );
      }
    }
  });

  let isTimeTraveling = false;
  let currentPath;

  // sync router on store change
  const storeUnwatch = store.watch(
    (state) => state[moduleName],
    (route) => {
      const { fullPath } = route;
      if (fullPath === currentPath) {
        return;
      }
      if (currentPath != null) {
        isTimeTraveling = true;
        router.push(route);
      }
      currentPath = fullPath;
    },
    { sync: true }
  );

  // sync store on router navigation
  const afterEachUnHook = router.afterEach((to, from) => {
    if (isTimeTraveling) {
      isTimeTraveling = false;
      return;
    }
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    currentPath = to.fullPath;
    store.commit(moduleName + "/ROUTE_CHANGED", { to, from, requiresAuth });
  });

  return function unsync() {
    // On unsync, remove router hook
    if (afterEachUnHook != null) {
      afterEachUnHook();
    }

    // On unsync, remove store watch
    if (storeUnwatch != null) {
      storeUnwatch();
    }

    // On unsync, unregister Module with store
    store.unregisterModule(moduleName);
  };
}

function cloneRoute(to, requiresAuth) {
  const clone = {
    name: to.name,
    path: to.path,
    hash: to.hash,
    query: to.query,
    params: to.params,
    fullPath: to.fullPath,
    meta: to.meta,
    requiresAuth
  };
  return Object.freeze(clone);
}
