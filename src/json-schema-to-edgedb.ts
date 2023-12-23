import { JSONSchema7TypeName } from "https://cdn.skypack.dev/-/@types/json-schema@v7.0.11-l1z4jBbPsf3kQoHq2vfn/dist=es2019,mode=types/index.d.ts";
import CodeBlockWriter from "https://deno.land/x/code_block_writer@11.0.3/mod.ts";
import { JSONSchema } from "./json-schema.ts";
import { Callback, traverseSchema } from "./traverse-schema.ts";

const writer = new CodeBlockWriter();
const annotation = `abstract annotation source_schema;`;

const scalarTypes = ["boolean", "string", "number", "integer"] as const;
export function isScalarType<S extends JSONSchema>(
  schema: S,
): schema is S & { type: typeof scalarTypes[number] } {
  return scalarTypes.includes(schema.type as any);
}

export function jsonSchemaToEdgeDB(schema: Exclude<JSONSchema, boolean>) {
  const pre: Callback<typeof schema> = (schema, ptr, root, parentPtr) => {
    if (schema.type === "number") {}
  };

  const post: Callback<typeof schema> = (schema, ptr, root, parentPtr) => {
    if (isScalarType(schema)) {
    }
  };

  traverseSchema(schema, { allKeys: true, cb: { pre, post } });
}

function jsonSchemaTypeToScalar(typeName: Omit<JSONSchema7TypeName, "object" | "array">) {
  switch (typeName) {
    case "boolean":
      return "bool";
    case "integer":
      return "int32";
    case "number":
      return "int32";
    case "string":
      return "str";
    case "null": {
      // ?????
      return null;
    }
  }
}

function writeScalar(writer: CodeBlockWriter, ent: { [key: string]: JSONSchema }, isRequired: boolean) {
  const t = ent[1].type;

  if (Array.isArray(t) || t === undefined) {
    console.error(`Cant handle this`);
    return;
  }
  if (isRequired) {
    writer.write(`required`);
  }
  const name = jsonSchemaTypeToScalar((t ?? "string") as any) ?? "str";
  return writer.write(`property ${ent[0]} -> ${name};`);
}

/**
 * type Repository {
 *   required property repoType -> str;
 *   required property url -> str;
 * }
 */

/**
 * To make life easier do the following before calling this function
 *
 * 1. Resolve all `$refs`
 * 2. Attempt to normalize any crazy `oneOf` / `anyOf` / `allOf`
 */
export function transformObjectSchema(name: string, schema: JSONSchema & { type: "object" }) {
  const writer = new CodeBlockWriter();
  const requiredFields = schema.required ?? [];
  writer.writeLine(`type ${name} {`);
  writer.indent(() => {
    if (schema.title !== undefined) {
      writer.writeLine(`annotation title := '${schema.title}'`);
    }
    if (schema.description !== undefined) {
      writer.writeLine(`annotation description := '${schema.description}'`);
    }
    if (schema.properties !== undefined) {
      Object.entries(schema.properties ?? {}).forEach((ent) => {
        const isRequired = requiredFields.includes(ent[0]);
        // @ts-ignore shutup
        writeScalar(writer, ent, isRequired);
      });
    }
    writer.write("\n}");
    // TODO: Not sure how to handle allof here
  });
  return writer.toString();
}
