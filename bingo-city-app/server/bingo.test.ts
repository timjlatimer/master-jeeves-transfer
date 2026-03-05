import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test User");
    expect(result?.openId).toBe("test-user-001");
  });
});

describe("news.list", () => {
  it("returns an array for public users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.news.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("petition.list", () => {
  it("returns an array for public users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.petition.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("router structure", () => {
  it("has all expected routers", () => {
    expect(appRouter._def.procedures).toBeDefined();
    // Check that key procedure paths exist
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("auth.me");
    expect(procedures).toContain("auth.logout");
    expect(procedures).toContain("news.list");
    expect(procedures).toContain("news.create");
    expect(procedures).toContain("petition.list");
    expect(procedures).toContain("petition.create");
    expect(procedures).toContain("petition.endorse");
    expect(procedures).toContain("bingoCard.list");
    expect(procedures).toContain("bingoCard.create");
    expect(procedures).toContain("bingoCard.update");
    expect(procedures).toContain("preferences.get");
    expect(procedures).toContain("preferences.update");
    expect(procedures).toContain("chat.history");
    expect(procedures).toContain("chat.send");
  });
});
