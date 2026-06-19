import { describe, expect, it } from "vitest";
import { mapSupabaseUser } from "../lib/authUser";

describe("mapSupabaseUser", () => {
  it("maps email and full_name from Google-style metadata", () => {
    const user = mapSupabaseUser({
      id: "abc-123",
      email: "joseph@example.com",
      app_metadata: {},
      user_metadata: {
        full_name: "Joseph Dilascio",
        avatar_url: "https://example.com/a.jpg",
      },
      aud: "authenticated",
      created_at: "",
    });

    expect(user).toEqual({
      id: "abc-123",
      email: "joseph@example.com",
      name: "Joseph Dilascio",
      avatarUrl: "https://example.com/a.jpg",
    });
  });

  it("falls back to name and picture fields", () => {
    const user = mapSupabaseUser({
      id: "x",
      email: "a@b.co",
      app_metadata: {},
      user_metadata: { name: "Alex", picture: "https://example.com/p.png" },
      aud: "authenticated",
      created_at: "",
    });

    expect(user.name).toBe("Alex");
    expect(user.avatarUrl).toBe("https://example.com/p.png");
  });

  it("handles missing metadata", () => {
    const user = mapSupabaseUser({
      id: "x",
      email: "a@b.co",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: "",
    });

    expect(user.email).toBe("a@b.co");
    expect(user.name).toBeUndefined();
    expect(user.avatarUrl).toBeUndefined();
  });
});
