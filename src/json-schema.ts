import {
  ContentEncoding,
  draft,
  Format,
  JSONSchema as _JSONSchema,
  keywords,
  TypeName,
} from "./json-schema-2020-12.ts";

export type JSONSchema = Exclude<_JSONSchema, boolean>;
export type { _JSONSchema as OriginJSONSchema };

export interface JSONSchema2020 extends JSONSchema {}

/**
 * A `JSONSchema` with `type=object`.
 */
export interface JSONSchemaObject extends JSONSchema {
  type: "object";
  properties: Record<string, JSONSchema>;
}

/**
 * A `JSONSchema` with `type=array`.
 */
export interface JSONSchemaArray extends JSONSchema {
  type: "array";
  items: JSONSchema;
}

/**
 * Represents a `JSONSchema` object in the [QuackWare](https://quack.software) registry. These `JSONSchema` objects have
 * gone through additional pre-processing and include additional metadata fields compared to a regular `JSONSchema`.
 */
export interface RegistrySchema extends JSONSchemaObject {
  $id: string;
  title: string;
  /** sha-1 of schema contents without meta fields */
  $sha?: string;
  /** Origin where the schema was sourced from */
  $origin?: string;
}

export type { JSONSchemaObject as ObjectSchema };
export { ContentEncoding, draft, Format, keywords, TypeName };
