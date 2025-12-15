import { mkdir, writeFile } from "fs/promises";
import openapi from "../openapi.json" assert { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

async function generateSpotifyClient() {
  await mkdir(targetDirectory, { recursive: true });

  const schemas = openapi.components.schemas;
  const typesToGenerate = Object.keys(schemas);

  for (const typeName of typesToGenerate) {
    const typeSchema = schemas[typeName];
    generateType(typeName, typeSchema);
  }
}

function generateType(typeName, typeSchema) {  
  const imports = new Set();
  const generatedCode = getGeneratedCode(typeName, typeSchema, imports);
  writeFile(`${targetDirectory}/${typeName}.ts`, generatedCode);
}

function getGeneratedCode(typeName, typeSchema, imports) {
  const generatedType = getGeneratedType(typeSchema, imports);
  const importLines = Array.from(imports)
    .map(type => `import { ${type} } from "./${type}";`)
    .join("\n");

  return `${importLines}${importLines ? "\n\n" : ""}export type ${typeName} = ${generatedType};`;
}

function getGeneratedType(typeSchema, imports, depth = 0) {
  if (typeSchema.allOf) {
    const types = typeSchema.allOf.map(subSchema => getGeneratedType(subSchema, imports, depth + 1));
    return types.join(' & ');
  }

  if (typeSchema.oneOf) {
    const types = typeSchema.oneOf.map(subSchema => getGeneratedType(subSchema, imports, depth + 1));
    return types.length > 1 ? `(${types.join(' | ')})` : types[0];
  }

  if (typeSchema.$ref) {
    const refType = typeSchema.$ref.split("/").pop();
    imports.add(refType);
    return refType;
  }

  const schemaType = typeSchema.type;

  switch (schemaType) {
    case "number":
    case "integer":
      return "number";
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "array": {
      if (!typeSchema.items) return "unknown[]";
      const itemType = getGeneratedType(typeSchema.items, imports, depth + 1);
      return itemType.includes('|') ? `(${itemType})[]` : `${itemType}[]`;
    }
    case "object": {
      if (!typeSchema.properties) return "Record<string, unknown>";

      const requiredFields = typeSchema.required ?? [];

      const properties = Object.entries(typeSchema.properties)
        .map(([propertyName, propertySchema]) => {
          const propertyType = getGeneratedType(propertySchema, imports, depth + 1);
          const isRequired = requiredFields.includes(propertyName);
          const optionalMark = isRequired ? "" : "?";
          return `  ${propertyName}${optionalMark}: ${propertyType};`;
        })
        .join("\n");

      return `{\n${properties}\n}`;
    }
    default:
      return "unknown";
  }
}

generateSpotifyClient();