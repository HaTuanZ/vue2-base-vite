import camelCase from "lodash/camelCase";

const requireModule = import.meta.globEager("./store-*.js");
const modules = [];
Object.keys(requireModule).forEach((fileName) => {
  const moduleName = camelCase(
    fileName
      .substring(fileName.indexOf("store-") + 5, fileName.lastIndexOf("."))

      .replace(/(\.\/|\.js)/g, "")
  );
  modules[moduleName] = {
    namespaced: true,
    ...requireModule[fileName].default,
  };
});
export default modules;
