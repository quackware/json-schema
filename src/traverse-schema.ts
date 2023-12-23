import { JSONSchema } from "./json-schema.ts";

export type Callback<S extends JSONSchema> = (
  schema: JSONSchema,
  jsonPtr: string,
  rootSchema: S,
  parentJsonPtr?: string,
  parentKeyword?: string,
  parentSchema?: JSONSchema,
  keyIndex?: string | number,
) => void;

export interface TraverseSchemaOptions<S extends JSONSchema> {
  allKeys?: boolean;
  cb:
    | Callback<S>
    | {
      pre?: Callback<S>;
      post?: Callback<S>;
    };
}

export const TRAVERSE_SCHEMA_KEYWORDS = {
  additionalItems: true,
  items: true,
  contains: true,
  additionalProperties: true,
  propertyNames: true,
  not: true,
  if: true,
  then: true,
  else: true,
};

export const TRAVERSE_SCHEMA_ARRAY_KEYWORDS = {
  items: true,
  allOf: true,
  anyOf: true,
  oneOf: true,
};

export const TRAVERSE_SCHEMA_PROP_KEYWORDS = {
  $defs: true,
  definitions: true,
  properties: true,
  patternProperties: true,
  dependencies: true,
};

export const TRAVERSE_SCHEMA_SKIP_KEYWORDS = {
  default: true,
  enum: true,
  const: true,
  required: true,
  maximum: true,
  minimum: true,
  exclusiveMaximum: true,
  exclusiveMinimum: true,
  multipleOf: true,
  maxLength: true,
  minLength: true,
  pattern: true,
  format: true,
  maxItems: true,
  minItems: true,
  uniqueItems: true,
  maxProperties: true,
  minProperties: true,
};

export function traverseSchema<S extends JSONSchema>(schema: S, opts: TraverseSchemaOptions<S>, cb?: Callback<S>) {
  const callbackFn = opts.cb || cb;
  const pre = typeof callbackFn == "function" ? callbackFn : callbackFn.pre ?? (() => {});
  const post = typeof callbackFn !== "function" ? callbackFn.post ?? (() => {}) : (() => {});

  _traverse(opts, pre, post, schema, "", schema);
}

function _traverse<S extends JSONSchema>(
  opts: TraverseSchemaOptions<S>,
  pre: Callback<S>,
  post: Callback<S>,
  schema: S,
  jsonPtr: string,
  rootSchema: S,
  parentJsonPtr?: string,
  parentKeyword?: string,
  parentSchema?: S,
  keyIndex?: string | number,
) {
  if (schema && typeof schema == "object" && !Array.isArray(schema)) {
    pre(
      schema,
      jsonPtr,
      rootSchema,
      parentJsonPtr,
      parentKeyword,
      parentSchema,
      keyIndex,
    );
    for (const key in schema) {
      const sch = schema[key];
      if (Array.isArray(sch)) {
        if (key in TRAVERSE_SCHEMA_ARRAY_KEYWORDS) {
          for (let i = 0; i < sch.length; i++) {
            _traverse(
              opts,
              pre,
              post,
              sch[i],
              jsonPtr + "/" + key + "/" + i,
              rootSchema,
              jsonPtr,
              key,
              schema,
              i,
            );
          }
        }
      } else if (key in TRAVERSE_SCHEMA_PROP_KEYWORDS) {
        if (sch && typeof sch == "object") {
          for (const prop in sch) {
            _traverse(
              opts,
              pre,
              post,
              // @ts-ignore nope
              sch[prop],
              jsonPtr + "/" + key + "/" + escapeJsonPtr(prop),
              rootSchema,
              jsonPtr,
              key,
              schema,
              prop,
            );
          }
        }
      } else if (
        key in TRAVERSE_SCHEMA_KEYWORDS
        || (opts.allKeys && !(key in TRAVERSE_SCHEMA_SKIP_KEYWORDS))
      ) {
        _traverse(
          opts,
          pre,
          post,
          // @ts-ignore nope
          sch,
          jsonPtr + "/" + key,
          rootSchema,
          jsonPtr,
          key,
          schema,
        );
      }
    }
    post(
      schema,
      jsonPtr,
      rootSchema,
      parentJsonPtr,
      parentKeyword,
      parentSchema,
      keyIndex,
    );
  }
}

export function escapeJsonPtr(str: string) {
  return str.replace(/~/g, "~0").replace(/\//g, "~1");
}
