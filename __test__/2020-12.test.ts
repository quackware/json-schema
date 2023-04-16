import { JSONSchema } from "../2020-12.ts";
import { assertObjectMatch } from "./deps.ts";

Deno.test("2020-12", async (t) => {
  await t.step("create new 2020-12 json schema instance", () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
      },
    };

    assertObjectMatch(schema, {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
      },
    });
  });
});
