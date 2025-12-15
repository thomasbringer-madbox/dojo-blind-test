import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" assert { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

async function generateSpotifyClient() {
  console.log("\nLaunched generate-spotify-client script");
  console.log('Generating Spotify client from OpenApi spec file...\n')
  await mkdir(targetDirectory, { recursive: true }); // Generate target directory

  const schemas = openapi.components.schemas;
  const typesToGenerate = Object.keys(schemas);

  for (const typeName of typesToGenerate) {
    const typeSchema = schemas[typeName];
    generateType(typeName, typeSchema);
  }
}

function generateType(typeName, typeSchema) {  
  console.log(`Generating type ${typeName}...`);

  const generatedCode = getGeneratedCode(typeName, typeSchema);

  writeFile(`${targetDirectory}/${typeName}.ts`, generatedCode);
}

function getGeneratedCode(typeName, typeSchema) {
  const generatedType = getGeneratedType(typeSchema);

  return `export type ${typeName} = ${generatedType};`;
}

function getGeneratedType(typeSchema) {
  const schemaType = typeSchema.type;

  // TO DO: Generate typescript code from schema
  switch (schemaType) {
    case "number":
    case "integer":
      return "number";
    case "string":
      return "string";
    case "boolean":
      return "boolean";
      case "array": {
        const itemType = getGeneratedType(typeSchema.items);
        return `${itemType}[]`;
      }  
      case "object": {
        if (!typeSchema.properties) {
          return "Record<string, unknown>";
        }
      
        const requiredFields = typeSchema.required ?? [];
      
        const properties = Object.entries(typeSchema.properties)
          .map(([propertyName, propertySchema]) => {
            const propertyType = getGeneratedType(propertySchema);
            const isRequired = requiredFields.includes(propertyName);
            const optionalMark = isRequired ? "" : "?";
      
            return `  ${propertyName}${optionalMark}: ${propertyType};`;
          })
          .join("\n");
      
        return `{\n${properties}\n}`;
      }
      
    default:
      return "";
  }
}

generateSpotifyClient();