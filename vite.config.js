import { defineConfig, loadEnv } from "vite";
const { createVuePlugin } = require("vite-plugin-vue2");
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";

const path = require("path");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const processEnvValues = {
    "process.env": Object.entries(env).reduce((prev, [key, val]) => {
      return {
        ...prev,
        [key]: val,
      };
    }, {}),
  };

  return {
    plugins: [createVuePlugin()],
    build: {
      rollupOptions: {
        plugins: [dynamicImportVars()],
      },
    },
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@api": path.resolve(__dirname, "./src/service/api"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@constant": path.resolve(__dirname, "./src/constant"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@models": path.resolve(__dirname, "./src/service/model"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@lang": path.resolve(__dirname, "./src/lang"),
        "@plugins": path.resolve(__dirname, "./src/plugins"),
        "@views": path.resolve(__dirname, "./src/views"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@service": path.resolve(__dirname, "./src/service"),
        "@router": path.resolve(__dirname, "./src/router"),
      },
    },
    define: processEnvValues,
  };
});
