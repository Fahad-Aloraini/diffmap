/**
 * Languages read with tree-sitter. TypeScript is not here: it keeps the more
 * exact TypeScript-compiler engine. Calls are matched by name (see the call graph).
 *
 * Each language's rules are in their own file in languages/: what a definition and a
 * call look like, what the grammar cannot read (prepare), and how names are matched.
 * languages/shared.ts holds the helpers several of them are built from.
 */
import { javascript } from "./languages/javascript.js";
import { python } from "./languages/python.js";
import { java } from "./languages/java.js";
import { go } from "./languages/go.js";
import { csharp } from "./languages/c-sharp.js";
import { php } from "./languages/php.js";
import { ruby } from "./languages/ruby.js";
import { rust } from "./languages/rust.js";
import { kotlin } from "./languages/kotlin.js";
import { swift } from "./languages/swift.js";
import { scala } from "./languages/scala.js";
import { c } from "./languages/c.js";
import { cpp } from "./languages/cpp.js";
import type { LanguageSpec } from "./languages/spec.js";

export * from "./languages/spec.js";
export { firstIdent, lastName } from "./languages/shared.js";

/** Later entries win an extension two languages claim (`.h`: C++ after C). */
export const LANGUAGES: LanguageSpec[] = [javascript, python, java, go, csharp, php, ruby, rust, kotlin, swift, scala, c, cpp];
