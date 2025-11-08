import fs from "fs";

const schemaPath = "prisma/schema.prisma";
const schema = fs.readFileSync(schemaPath, "utf8");

const enumRegex = /enum\s+(\w+)\s+\{/g;
const enumNames = new Set();
let enumMatch;
while ((enumMatch = enumRegex.exec(schema)) !== null) {
  enumNames.add(enumMatch[1]);
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1_$2")
    .toLowerCase();
}

function pluralizeWord(word) {
  if (/[^aeiou]y$/i.test(word)) {
    return word.replace(/y$/i, "ies");
  }
  if (/(s|x|z|ch|sh)$/i.test(word)) {
    return `${word}es`;
  }
  return `${word}s`;
}

function pluralizeSnakeCase(str) {
  const parts = str.split("_");
  const last = parts.pop() ?? "";
  parts.push(pluralizeWord(last));
  return parts.join("_");
}

const scalarTypes = new Set([
  "String",
  "Int",
  "Float",
  "Decimal",
  "DateTime",
  "Boolean",
  "Json",
  "BigInt",
  "Bytes",
]);

function isScalarType(type) {
  const normalized = type.replace(/[?\[\]]/g, "");
  return scalarTypes.has(normalized) || enumNames.has(normalized);
}

const lines = schema.split("\n");
const output = [];

const modelInfos = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const modelMatch = line.match(/^model\s+(\w+)\s+\{/);
  if (!modelMatch) {
    output.push(line);
    continue;
  }

  const modelName = modelMatch[1];
  const tableName = pluralizeSnakeCase(toSnakeCase(modelName));
  const blockLines = [line];
  while (i + 1 < lines.length) {
    blockLines.push(lines[++i]);
    if (lines[i].trim() === "}") {
      break;
    }
  }

  const innerLines = blockLines.slice(1, -1);
  const processed = [];
  let hasModelMap = false;
  const columnRenames = [];

  for (const innerLine of innerLines) {
    const trimmed = innerLine.trim();
    if (trimmed === "" || trimmed.startsWith("//")) {
      processed.push(innerLine);
      continue;
    }

    if (trimmed.startsWith("@@map")) {
      const indent = innerLine.match(/^\s*/)?.[0] ?? "";
      processed.push(`${indent}@@map("${tableName}")`);
      hasModelMap = true;
      continue;
    }

    if (trimmed.startsWith("@@")) {
      processed.push(innerLine);
      continue;
    }

    if (trimmed.startsWith("@")) {
      processed.push(innerLine);
      continue;
    }

    const fieldMatch = innerLine.match(/^(\s*)(\w+)\s+([^\s]+)(.*)$/);
    if (!fieldMatch) {
      processed.push(innerLine);
      continue;
    }

    const [, indent, fieldName, fieldTypeRaw, restRaw] = fieldMatch;
    const rest = restRaw ?? "";

    if (rest.includes("@relation")) {
      processed.push(innerLine);
      continue;
    }

    if (!isScalarType(fieldTypeRaw)) {
      if (fieldTypeRaw.includes("[]")) {
        const baseType = fieldTypeRaw.replace(/\[\]/g, "");
        if (!isScalarType(baseType)) {
          processed.push(innerLine);
          continue;
        }
      } else {
        processed.push(innerLine);
        continue;
      }
    }

    const normalizedName = toSnakeCase(fieldName);

    if (normalizedName === fieldName) {
      processed.push(innerLine);
      continue;
    }

    if (rest.includes("@map(")) {
      processed.push(innerLine);
      continue;
    }

    columnRenames.push({ original: fieldName, column: normalizedName });

    let remainder = rest;
    if (remainder.length > 0 && !remainder.startsWith(" ")) {
      remainder = ` ${remainder.trimStart()}`;
    }

    if (remainder.length > 0 && !remainder.endsWith(" ")) {
      remainder = `${remainder} `;
    }

    const mapSegment = `@map("${normalizedName}")`;
    const separator = remainder.length === 0 ? " " : "";
    processed.push(`${indent}${fieldName} ${fieldTypeRaw}${separator}${remainder}${mapSegment}`.replace(/\s+$/, ""));
  }

  if (!hasModelMap) {
    const modelIndent = innerLines.find((l) => l.trim() !== "")?.match(/^\s*/)?.[0] ?? "  ";
    const insertIndex = processed.findIndex((l) => l.trim().startsWith("@@"));
    const mapLine = `${modelIndent}@@map("${tableName}")`;
    if (insertIndex === -1) {
      processed.push(mapLine);
    } else {
      processed.splice(insertIndex, 0, mapLine);
    }
  }

  output.push(blockLines[0], ...processed, blockLines[blockLines.length - 1]);
  modelInfos.push({ modelName, tableName, columnRenames });
}

fs.writeFileSync(schemaPath, output.join("\n"), "utf8");

const migrationStatements = [];
for (const { modelName, tableName, columnRenames } of modelInfos) {
  for (const { original, column } of columnRenames) {
    migrationStatements.push(`DO $$\nBEGIN\n  IF EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_schema = 'public'\n      AND table_name = '${modelName}'\n      AND column_name = '${original}'\n  ) THEN\n    EXECUTE 'ALTER TABLE "${modelName}" RENAME COLUMN "${original}" TO ${column}';\n  END IF;\nEND $$;`);
  }

  migrationStatements.push(`DO $$\nBEGIN\n  IF EXISTS (\n    SELECT 1 FROM information_schema.tables\n    WHERE table_schema = 'public'\n      AND table_name = '${modelName}'\n  ) THEN\n    EXECUTE 'ALTER TABLE "${modelName}" RENAME TO ${tableName}';\n  END IF;\nEND $$;`);
}

if (migrationStatements.length > 0) {
  const migrationDir = "migrations";
  const fileName = `${Date.now()}_pascal_to_snake.sql`;
  const fullPath = `${migrationDir}/${fileName}`;
  fs.writeFileSync(fullPath, migrationStatements.join("\n\n"), "utf8");
  console.log(`Generated migration at ${fullPath}`);
}
