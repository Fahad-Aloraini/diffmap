/** PHP. Rules for this language only: changing them changes no other language. */
import type { LanguageSpec } from "./spec.js";
import { field, firstChild, parentsIn, returnsIn } from "./shared.js";

export const php: LanguageSpec = {
  id: "php",
  extensions: [".php"],
  variableTypes: ["typeFirst", "constructed"],
  defs: {
    class_declaration: { kind: "class", supers: parentsIn("base_clause", "class_interface_clause") },
    interface_declaration: { kind: "interface", supers: parentsIn("base_clause") },
    trait_declaration: { kind: "trait" },
    enum_declaration: { kind: "enum" },
    method_declaration: { kind: "method", returns: returnsIn("return_type") },
    function_definition: { kind: "function", returns: returnsIn("return_type") },
  },
  calls: {
    function_call_expression: field("function"),
    member_call_expression: field("name"),
    nullsafe_member_call_expression: field("name"),
    scoped_call_expression: field("name"),
    object_creation_expression: firstChild,
  },
};
