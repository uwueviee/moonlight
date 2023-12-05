import { WebpackModuleFunc, WebpackModule } from "@moonlight-mod/types";
import { Spacepack } from "@moonlight-mod/types/coreExtensions";
import { WebpackRequireType } from "@moonlight-mod/types/discord/webpack";

declare global {
  interface Window {
    spacepack: Spacepack;
  }
}

export default (module: any, exports: any, require: WebpackRequireType) => {
  const cache = require.c;
  const modules = require.m;

  const spacepack: Spacepack = {
    require,
    modules,
    cache,

    inspect: (module: number | string) => {
      if (typeof module === "number") {
        module = module.toString();
      }

      if (!(module in modules)) {
        return null;
      }

      const func = modules[module];
      if (func.__moonlight === true) {
        return func;
      }

      const funcStr = func.toString();

      return new Function(
        "module",
        "exports",
        "require",
        `(${funcStr}).apply(this, arguments)\n` +
          `//# sourceURL=Webpack-Module-${module}`
      ) as WebpackModuleFunc;
    },

    findByCode: (...args: (string | RegExp)[]) => {
      return Object.entries(modules)
        .filter(
          ([id, mod]) =>
            !args.some(
              (item) =>
                !(item instanceof RegExp
                  ? item.test(mod.toString())
                  : mod.toString().indexOf(item) !== -1)
            )
        )
        .map(([id]) => {
          //if (!(id in cache)) require(id);
          //return cache[id];

          let exports;
          try {
            exports = require(id);
          } catch (e) {
            console.error(e);
            debugger;
          }

          return {
            id,
            exports
          };
        })
        .filter((item) => item != null);
    },

    findByExports: (...args: string[]) => {
      return Object.entries(cache)
        .filter(
          ([id, { exports }]) =>
            !args.some(
              (item) =>
                !(
                  exports != undefined &&
                  exports != window &&
                  (exports?.[item] ||
                    exports?.default?.[item] ||
                    exports?.Z?.[item] ||
                    exports?.ZP?.[item])
                )
            )
        )
        .map((item) => item[1])
        .reduce<WebpackModule[]>((prev, curr) => {
          if (!prev.includes(curr)) prev.push(curr);
          return prev;
        }, []);
    },

    findObjectFromKey: (exports: Record<string, any>, key: string) => {
      let subKey;
      if (key.indexOf(".") > -1) {
        const splitKey = key.split(".");
        key = splitKey[0];
        subKey = splitKey[1];
      }
      for (const exportKey in exports) {
        const obj = exports[exportKey];
        if (obj && obj[key] !== undefined) {
          if (subKey) {
            if (obj[key][subKey]) return obj;
          } else {
            return obj;
          }
        }
      }
      return null;
    },

    findObjectFromValue: (exports: Record<string, any>, value: any) => {
      for (const exportKey in exports) {
        const obj = exports[exportKey];
        if (obj == value) return obj;
        for (const subKey in obj) {
          if (obj && obj[subKey] == value) {
            return obj;
          }
        }
      }
      return null;
    },

    findObjectFromKeyValuePair: (
      exports: Record<string, any>,
      key: string,
      value: any
    ) => {
      for (const exportKey in exports) {
        const obj = exports[exportKey];
        if (obj && obj[key] == value) {
          return obj;
        }
      }
      return null;
    },

    findFunctionByStrings: (
      exports: Record<string, any>,
      ...strings: (string | RegExp)[]
    ) => {
      return (
        Object.entries(exports).filter(
          ([index, func]) =>
            typeof func === "function" &&
            !strings.some(
              (query) =>
                !(query instanceof RegExp
                  ? func.toString().match(query)
                  : func.toString().includes(query))
            )
        )?.[0]?.[1] ?? null
      );
    }
  };

  module.exports = spacepack;

  if (
    moonlight.getConfigOption<boolean>("spacepack", "addToGlobalScope") === true
  ) {
    window.spacepack = spacepack;
  }
};