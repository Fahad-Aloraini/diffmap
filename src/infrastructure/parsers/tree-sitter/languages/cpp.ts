/** C++. Rules for this language only: changing them changes no other language. */
import type { LanguageSpec } from "./spec.js";
import { field, hasBody, parentsIn, returnsIn, scopedCall } from "./shared.js";
import { declaratorName } from "./c.js";

export const cpp: LanguageSpec = {
  id: "cpp",
  extensions: [".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx"],
  family: "c",
  variableTypes: ["typeFirst", "constructed"],
  defs: {
    function_definition: { kind: "function", name: declaratorName, returns: returnsIn("type") },
    class_specifier: { kind: "class", when: hasBody, supers: parentsIn("base_class_clause") },
    struct_specifier: { kind: "struct", when: hasBody, supers: parentsIn("base_class_clause") },
    namespace_definition: { kind: "module", containerOnly: true },
  },
  calls: { call_expression: scopedCall("scope"), new_expression: field("type") },
};
