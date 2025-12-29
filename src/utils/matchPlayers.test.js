import { getPlayerAuthId } from "./matchPlayers";

describe("getPlayerAuthId", () => {
  it("returns null for null or undefined input without throwing", () => {
    expect(getPlayerAuthId(null)).toBeNull();
    expect(getPlayerAuthId(undefined)).toBeNull();
  });

  it("returns primitive ids unchanged", () => {
    expect(getPlayerAuthId("abc")).toBe("abc");
    expect(getPlayerAuthId(0)).toBe(0);
    expect(getPlayerAuthId(42)).toBe(42);
  });

  it("prefers top-level identifiers before nested fields", () => {
    expect(getPlayerAuthId({ auth_id: 10, user_id: 20 })).toBe(10);
    expect(getPlayerAuthId({ user_id: 20, id: 30 })).toBe(20);
    expect(getPlayerAuthId({ id: 30, profile_id: 40 })).toBe(30);
  });

  it("falls back to other known identifiers", () => {
    expect(getPlayerAuthId({ profile_id: 50 })).toBe(50);
    expect(getPlayerAuthId({ player_auth_id: 60 })).toBe(60);
    expect(getPlayerAuthId({ player_id: 70 })).toBe(70);
  });

  it("reads identifiers from nested user objects", () => {
    expect(getPlayerAuthId({ user: { auth_id: 80 } })).toBe(80);
    expect(getPlayerAuthId({ user: { id: 90 } })).toBe(90);
  });
});
