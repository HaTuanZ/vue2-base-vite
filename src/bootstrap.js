import { checkCurrentLang } from "./plugins/i18n";
import router from "./router";
import { initData as initDataAuth } from "./service/http/auth";
import store from "./store";
import { sync } from "./store/store-router";

import "@plugins";
import "@components";

checkCurrentLang();
sync(store, router);
initDataAuth();
export { router, store };
