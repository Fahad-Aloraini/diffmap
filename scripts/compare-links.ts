/**
 * What a change to the language rules does to real code, language by language.
 *
 *   npx vite-node scripts/compare-links.ts <repo folder> --save before.json     (on the old code)
 *   npx vite-node scripts/compare-links.ts <repo folder> --against before.json  (on the new code)
 *       [--show N]
 *
 * It reads every file tree-sitter knows in the repo, lists the symbols and the
 * caller -> target links, and with --against says per language how many symbols
 * and links went and came, with N (default 5) examples of each. A change meant
 * for one language should show nothing for the others.
 *
 * It does not say whether a link is right; scripts/measure-accuracy.ts does, with
 * a compiler index.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { TreeSitterEngine } from "../src/infrastructure/parsers/tree-sitter/engine.js";
import { TreeSitterCallGraph } from "../src/infrastructure/parsers/tree-sitter/tree-sitter-call-graph.js";

const SKIP = new Set([".git", "node_modules", "build", "dist", "target", ".build", "Pods", "vendor"]);

const args = process.argv.slice(2);
const value = (flag: string): string | undefined => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const save = value("--save");
const against = value("--against");
const show = Number(value("--show") ?? 5);
const root = args[0] && !args[0].startsWith("--") ? resolve(args[0]) : "";
if (!root || (!save && !against)) {
  console.error("Usage: npx vite-node scripts/compare-links.ts <repo folder> --save file.json | --against file.json [--show N]");
  process.exit(1);
}

interface Snapshot {
  /** Per language id (see languages/): symbol ids and "caller -> target" links made from its files. */
  languages: Record<string, { files: number; errors: number; symbols: string[]; links: string[] }>;
}

const engine = await TreeSitterEngine.load();
const files: { path: string; source: string }[] = [];
const walk = (dir: string): void => {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (engine.extensions.includes(extname(name).toLowerCase()) && st.size < 1_000_000) {
      files.push({ path: relative(root, full).split("\\").join("/"), source: readFileSync(full, "utf8") });
    }
  }
};
walk(root);

const now: Snapshot = { languages: {} };
const of = (path: string) => {
  const id = engine.spec(path)?.id ?? extname(path);
  return (now.languages[id] ??= { files: 0, errors: 0, symbols: [], links: [] });
};
for (const f of files) {
  const lang = of(f.path);
  lang.files++;
  if (engine.with(f.path, f.source, (tree) => (tree as unknown as { hasError: boolean }).hasError)) lang.errors++;
}
const { meta, collector } = new TreeSitterCallGraph(engine).link(files);
for (const id of meta.keys()) of(id.slice(0, id.indexOf("#"))).symbols.push(id);
for (const e of collector.calls.values()) of(e.from.slice(0, e.from.indexOf("#"))).links.push(`${e.from} -> ${e.to}${e.kind === "calls" ? "" : ` (${e.kind})`}`);

if (save) {
  writeFileSync(save, JSON.stringify(now));
  for (const [id, l] of Object.entries(now.languages)) console.log(`${id.padEnd(12)} ${l.files} files, ${l.errors} with a parse error, ${l.symbols.length} symbols, ${l.links.length} links`);
  console.log(`saved to ${save}`);
} else {
  const before = JSON.parse(readFileSync(against!, "utf8")) as Snapshot;
  const diff = (a: string[], b: string[]) => {
    const inB = new Set(b);
    return a.filter((x) => !inB.has(x));
  };
  const examples = (label: string, list: string[]) => {
    const step = Math.max(1, Math.floor(list.length / show));
    for (let i = 0; i < list.length && i / step < show; i += step) console.log(`      ${label} ${list[i]}`);
  };
  let changed = 0;
  for (const id of [...new Set([...Object.keys(before.languages), ...Object.keys(now.languages)])].sort()) {
    const a = before.languages[id] ?? { files: 0, errors: 0, symbols: [], links: [] };
    const b = now.languages[id] ?? { files: 0, errors: 0, symbols: [], links: [] };
    const goneSymbols = diff(a.symbols, b.symbols);
    const newSymbols = diff(b.symbols, a.symbols);
    const goneLinks = diff(a.links, b.links);
    const newLinks = diff(b.links, a.links);
    const same = !goneSymbols.length && !newSymbols.length && !goneLinks.length && !newLinks.length && a.errors === b.errors;
    console.log(
      `${id.padEnd(12)} ${b.files} files` +
        (same
          ? `: the same (${b.symbols.length} symbols, ${b.links.length} links, ${b.errors} files with a parse error)`
          : `: parse errors ${a.errors} -> ${b.errors}; symbols ${a.symbols.length} -> ${b.symbols.length} (${goneSymbols.length} gone, ${newSymbols.length} new); ` +
            `links ${a.links.length} -> ${b.links.length} (${goneLinks.length} gone, ${newLinks.length} new)`),
    );
    if (same) continue;
    changed++;
    examples("- symbol", goneSymbols);
    examples("+ symbol", newSymbols);
    examples("- link", goneLinks);
    examples("+ link", newLinks);
  }
  console.log(changed ? `\n${changed} language${changed > 1 ? "s" : ""} changed.` : "\nNothing changed.");
}
