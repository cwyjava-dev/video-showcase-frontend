import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("videos API", () => {
  it("public users can list published videos", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const videos = await caller.videos.list();
    expect(Array.isArray(videos)).toBe(true);
  });

  it("public users can access categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("public users can access tags", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const tags = await caller.tags.list();
    expect(Array.isArray(tags)).toBe(true);
  });

  it("admin users can access admin video list", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const videos = await caller.admin.videos.list();
    expect(Array.isArray(videos)).toBe(true);
  });

  it("admin users can access admin categories list", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.admin.categories.list();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("admin users can access admin tags list", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tags = await caller.admin.tags.list();
    expect(Array.isArray(tags)).toBe(true);
  });
});
