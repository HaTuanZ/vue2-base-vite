import { merge } from "lodash";

import message from "@/lang/en/default.json";

let trans = merge(message);

const requireTrans = import.meta.globEager("./*.json");
for (const key in requireTrans) {
  if (key == "./default.json") continue;
  const keyTrans = key.replace(/^\.\//, "").replace(/\.\w+$/, "");
  trans = merge(trans, { [keyTrans]: requireTrans[key].default });
}
export default trans;
