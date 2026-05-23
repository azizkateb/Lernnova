import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    files.push(fullPath);
  }

  return files;
};

const isSourceFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return [".js", ".jsx", ".ts", ".tsx"].includes(ext);
};

const uniqueSorted = (arr) => Array.from(new Set(arr)).sort();

const collectTranslationKeys = (content) => {
  const literalKeys = [];
  const dynamicKeys = [];

  const literalRe = /\bt\s*\(\s*(['"])([^'"\\]+)\1/g;
  let match;
  while ((match = literalRe.exec(content))) {
    literalKeys.push(match[2]);
  }

  const templateRe = /\bt\s*\(\s*`([^`]+)`/g;
  while ((match = templateRe.exec(content))) {
    dynamicKeys.push(`\`${match[1]}\``);
  }

  const identifierRe = /\bt\s*\(\s*([A-Za-z_$][\w$]*)\s*(?:,|\))/g;
  while ((match = identifierRe.exec(content))) {
    dynamicKeys.push(match[1]);
  }

  return {
    literalKeys,
    dynamicKeys,
  };
};

const flattenTranslations = (obj, prefix = "", out = new Set()) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return out;

  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenTranslations(value, nextKey, out);
      continue;
    }

    out.add(nextKey);
  }

  return out;
};

const main = async () => {
  const translationModuleUrl = pathToFileURL(
    path.join(srcRoot, "i18n", "translations.js")
  ).href;
  const translationModule = await import(translationModuleUrl);
  const translations = translationModule.translations;

  if (!translations?.en || !translations?.ar || !translations?.de) {
    throw new Error("translations.en/ar/de must exist in src/i18n/translations.js");
  }

  const allFiles = walk(srcRoot).filter(isSourceFile);

  const usedLiteralKeys = [];
  const usedDynamicKeys = [];

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const { literalKeys, dynamicKeys } = collectTranslationKeys(content);
    usedLiteralKeys.push(...literalKeys);
    usedDynamicKeys.push(
      ...dynamicKeys.map((k) => `${path.relative(projectRoot, filePath)}: ${k}`)
    );
  }

  const usedKeys = uniqueSorted(usedLiteralKeys);

  const knownKeys = {
    en: flattenTranslations(translations.en),
    ar: flattenTranslations(translations.ar),
    de: flattenTranslations(translations.de),
  };

  const missing = {
    en: [],
    ar: [],
    de: [],
  };

  for (const key of usedKeys) {
    for (const lang of ["en", "ar", "de"]) {
      if (!knownKeys[lang].has(key)) {
        missing[lang].push(key);
      }
    }
  }

  const dynamic = uniqueSorted(usedDynamicKeys);

  const hasMissing =
    missing.en.length > 0 || missing.ar.length > 0 || missing.de.length > 0;

  const printMissing = (lang) => {
    if (missing[lang].length === 0) return;
    console.log(`\nMissing keys (${lang}):`);
    for (const key of missing[lang]) console.log(`- ${key}`);
  };

  console.log(`Scanned ${allFiles.length} files.`);
  console.log(`Found ${usedKeys.length} literal t() keys.`);

  printMissing("en");
  printMissing("ar");
  printMissing("de");

  if (dynamic.length > 0) {
    console.log("\nDynamic/non-literal t() keys (manual review):");
    for (const item of dynamic) console.log(`- ${item}`);
  }

  if (hasMissing) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

