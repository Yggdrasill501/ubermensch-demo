import { describe, expect, it } from "vitest";
import { client } from "./helpers.js";

describe("catalog", () => {
  it("lists products", async () => {
    const res = await client().get("/products");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
