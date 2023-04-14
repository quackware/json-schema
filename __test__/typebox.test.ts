import { Static, T } from "../mod.ts";
import { assertType, IsExact } from "./deps.ts";

Deno.test("typebox", async (t) => {
  await t.step("sanity check", () => {
    const literal = T.TemplateLiteral([
      T.Literal("option"),
      T.Union([
        T.Literal("A"),
        T.Literal("B"),
      ]),
    ]);

    assertType<IsExact<Static<typeof literal>, "optionA" | "optionB">>;
  });
});
