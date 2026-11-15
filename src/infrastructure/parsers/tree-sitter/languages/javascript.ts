/** JavaScript (TypeScript is not here: it uses the TypeScript compiler). Rules for this language only: changing them changes no other language. */
import type { LanguageSpec } from "./spec.js";
import { field } from "./shared.js";

export const javascript: LanguageSpec = {
  id: "javascript",
  extensions: [".js", ".jsx", ".mjs", ".cjs"],
  variableTypes: ["constructed"],
  defs: {
    function_declaration: { kind: "function" },
    generator_function_declaration: { kind: "function" },
    class_declaration: { kind: "class" },
    method_definition: { kind: "method" },
    variable_declarator: {
      kind: "arrow",
      when: (n) => /^(arrow_function|function|function_expression)$/.test(n.childForFieldName("value")?.type ?? ""),
    },
    // class A { handler = () => {...} }
    field_definition: {
      kind: "arrow",
      when: (n) => /^(arrow_function|function|function_expression)$/.test(n.childForFieldName("value")?.type ?? ""),
      name: (n) => n.childForFieldName("property")?.text ?? null,
    },
  },
  calls: { call_expression: field("function"), new_expression: field("constructor") },
};
