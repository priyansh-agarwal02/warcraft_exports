import { describe, expect, it } from "vitest"
import { likeExact } from "@/lib/like-escape"

describe("likeExact", () => {
  it("neutralises every wildcard PostgREST understands", () => {
    expect(likeExact("%")).toBe("\\%")
    expect(likeExact("a_b")).toBe("a\\_b")
    expect(likeExact("*@gmail.com")).toBe("\\%@gmail.com")
    expect(likeExact("back\\slash")).toBe("back\\\\slash")
  })
  it("leaves normal values untouched", () => {
    expect(likeExact("SAVE10")).toBe("SAVE10")
    expect(likeExact("john.doe@example.com")).toBe("john.doe@example.com")
  })
})
