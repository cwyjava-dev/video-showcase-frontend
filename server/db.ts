import { eq, like, or, desc, inArray, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, videos, categories, tags, videoTags, InsertVideo, InsertCategory, InsertTag, InsertVideoTag } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== Video Functions ====================

export async function getAllVideos(filters?: { categoryId?: number; tagIds?: number[]; search?: string; status?: string }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(videos).$dynamic();

  const conditions = [];
  
  if (filters?.status) {
    conditions.push(eq(videos.status, filters.status as any));
  }
  
  if (filters?.categoryId) {
    conditions.push(eq(videos.categoryId, filters.categoryId));
  }
  
  if (filters?.search) {
    conditions.push(
      or(
        like(videos.title, `%${filters.search}%`),
        like(videos.description, `%${filters.search}%`)
      )!
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  let result = await query.orderBy(desc(videos.createdAt));

  // Filter by tags if provided
  if (filters?.tagIds && filters.tagIds.length > 0) {
    const videoIds = result.map(v => v.id);
    if (videoIds.length > 0) {
      const videoTagsResult = await db
        .select()
        .from(videoTags)
        .where(
          and(
            inArray(videoTags.videoId, videoIds),
            inArray(videoTags.tagId, filters.tagIds)
          )
        );
      
      const filteredVideoIds = new Set(videoTagsResult.map(vt => vt.videoId));
      result = result.filter(v => filteredVideoIds.has(v.id));
    }
  }

  return result;
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getVideoBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(videos).where(eq(videos.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVideo(video: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(videos).values(video) as any;
  return Number(result.insertId);
}

export async function updateVideo(id: number, video: Partial<InsertVideo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(videos).set(video).where(eq(videos.id, id));
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete associated video tags first
  await db.delete(videoTags).where(eq(videoTags.videoId, id));
  // Delete the video
  await db.delete(videos).where(eq(videos.id, id));
}

export async function incrementVideoViews(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(videos).set({ viewCount: sql`${videos.viewCount} + 1` }).where(eq(videos.id, id));
}

// ==================== Category Functions ====================

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(categories).values(category) as any;
  return Number(result.insertId);
}

export async function updateCategory(id: number, category: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(categories).set(category).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(categories).where(eq(categories.id, id));
}

// ==================== Tag Functions ====================

export async function getAllTags() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tags).orderBy(tags.name);
}

export async function getTagById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTag(tag: InsertTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tags).values(tag) as any;
  return Number(result.insertId);
}

export async function updateTag(id: number, tag: Partial<InsertTag>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tags).set(tag).where(eq(tags.id, id));
}

export async function deleteTag(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete associated video tags first
  await db.delete(videoTags).where(eq(videoTags.tagId, id));
  // Delete the tag
  await db.delete(tags).where(eq(tags.id, id));
}

// ==================== Video Tag Functions ====================

export async function getVideoTags(videoId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ tag: tags })
    .from(videoTags)
    .innerJoin(tags, eq(videoTags.tagId, tags.id))
    .where(eq(videoTags.videoId, videoId));

  return result.map(r => r.tag);
}

export async function addVideoTag(videoTag: InsertVideoTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(videoTags).values(videoTag);
}

export async function removeVideoTag(videoId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(videoTags).where(
    and(
      eq(videoTags.videoId, videoId),
      eq(videoTags.tagId, tagId)
    )
  );
}

export async function setVideoTags(videoId: number, tagIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Remove all existing tags
  await db.delete(videoTags).where(eq(videoTags.videoId, videoId));

  // Add new tags
  if (tagIds.length > 0) {
    await db.insert(videoTags).values(
      tagIds.map(tagId => ({ videoId, tagId }))
    );
  }
}
