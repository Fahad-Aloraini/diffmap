/** Ruby. Rules for this language only: changing them changes no other language. */
import type { LanguageSpec } from "./spec.js";
import { lastName, parentsIn } from "./shared.js";

export const ruby: LanguageSpec = {
  id: "ruby",
  extensions: [".rb"],
  variableTypes: ["rubyNew"],
  defs: {
    class: { kind: "class", supers: parentsIn("superclass") },
    module: { kind: "module" },
    method: { kind: "method" },
    singleton_method: { kind: "method" },
  },
  calls: {
    // Svc.new -> "Svc"; anything else -> the method name
    call: (n) => {
      const method = n.childForFieldName("method")?.text ?? null;
      return method === "new" ? lastName(n.childForFieldName("receiver")) : method;
    },
  },
};
