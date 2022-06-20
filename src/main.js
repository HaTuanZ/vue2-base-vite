import Vue from "vue";
import App from "./App.vue";
import { router, store } from "./bootstrap.js";
import i18n from "@plugins/i18n";
import "@assets/styles/tailwind.css";
import mdiVue from "mdi-vue/v2";
import * as mdijs from "@mdi/js";
Vue.use(mdiVue, {
  icons: mdijs,
});
window.onload = function () {
  const app = new Vue({
    el: "#app",
    i18n,
    router,
    store,
    render: (h) => h(App),
  });
};
