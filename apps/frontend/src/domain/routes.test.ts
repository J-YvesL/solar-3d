import { describe, expect, it } from "vitest";
import { pathForBody, bodyIdFromPath } from "./routes";

const VALID = new Set(["sun", "earth", "mars", "moon", "titan", "io"]);

describe("pathForBody", () => {
  it("null → /", () => expect(pathForBody(null)).toBe("/"));
  it("earth → /earth", () => expect(pathForBody("earth")).toBe("/earth"));
  it("moon → /moon", () => expect(pathForBody("moon")).toBe("/moon"));
  it("sun → /sun", () => expect(pathForBody("sun")).toBe("/sun"));
});

describe("bodyIdFromPath", () => {
  it("/earth → earth", () => expect(bodyIdFromPath("/earth", VALID)).toBe("earth"));
  it("/sun → sun", () => expect(bodyIdFromPath("/sun", VALID)).toBe("sun"));
  it("/moon → moon", () => expect(bodyIdFromPath("/moon", VALID)).toBe("moon"));
  it("/ → null (system view)", () => expect(bodyIdFromPath("/", VALID)).toBeNull());
  it("/pluto → null (unknown)", () => expect(bodyIdFromPath("/pluto", VALID)).toBeNull());
  it("empty string → null", () => expect(bodyIdFromPath("", VALID)).toBeNull());
  it("path without leading slash → treated as id", () =>
    expect(bodyIdFromPath("earth", VALID)).toBe("earth"));
  it("unknown path → null", () => expect(bodyIdFromPath("/asteroid", VALID)).toBeNull());
});
