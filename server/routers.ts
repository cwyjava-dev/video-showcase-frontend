import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Public video routes
  videos: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        tagIds: z.array(z.number()).optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const videos = await db.getAllVideos({
          ...input,
          status: 'published',
        });
        return videos;
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const video = await db.getVideoBySlug(input.slug);
        if (!video) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found' });
        }
        return video;
      }),

    getTags: publicProcedure
      .input(z.object({ videoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideoTags(input.videoId);
      }),

    incrementViews: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementVideoViews(input.id);
        return { success: true };
      }),
  }),

  // Public category routes
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
  }),

  // Public tag routes
  tags: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTags();
    }),
  }),

  // Admin video management
  admin: router({
    videos: router({
      list: adminProcedure
        .input(z.object({
          categoryId: z.number().optional(),
          tagIds: z.array(z.number()).optional(),
          search: z.string().optional(),
          status: z.enum(['draft', 'published', 'archived']).optional(),
        }).optional())
        .query(async ({ input }) => {
          return await db.getAllVideos(input);
        }),

      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const video = await db.getVideoById(input.id);
          if (!video) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found' });
          }
          return video;
        }),

      create: adminProcedure
        .input(z.object({
          title: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          videoUrl: z.string(),
          videoKey: z.string(),
          thumbnailUrl: z.string().optional(),
          thumbnailKey: z.string().optional(),
          duration: z.number().optional(),
          fileSize: z.number().optional(),
          mimeType: z.string().optional(),
          categoryId: z.number().optional(),
          tagIds: z.array(z.number()).optional(),
          status: z.enum(['draft', 'published', 'archived']).default('published'),
        }))
        .mutation(async ({ input, ctx }) => {
          const { tagIds, ...videoData } = input;
          const videoId = await db.createVideo({
            ...videoData,
            uploadedBy: ctx.user.id,
          });

          if (tagIds && tagIds.length > 0) {
            await db.setVideoTags(videoId, tagIds);
          }

          return { id: videoId };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          description: z.string().optional(),
          videoUrl: z.string().optional(),
          videoKey: z.string().optional(),
          thumbnailUrl: z.string().optional(),
          thumbnailKey: z.string().optional(),
          duration: z.number().optional(),
          fileSize: z.number().optional(),
          mimeType: z.string().optional(),
          categoryId: z.number().optional(),
          tagIds: z.array(z.number()).optional(),
          status: z.enum(['draft', 'published', 'archived']).optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, tagIds, ...videoData } = input;
          await db.updateVideo(id, videoData);

          if (tagIds !== undefined) {
            await db.setVideoTags(id, tagIds);
          }

          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteVideo(input.id);
          return { success: true };
        }),

      uploadVideo: adminProcedure
        .input(z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          mimeType: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
          const buffer = Buffer.from(input.fileData, 'base64');
          const fileKey = `videos/${ctx.user.id}/${Date.now()}-${input.fileName}`;
          
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          
          return { url, key: fileKey };
        }),

      uploadThumbnail: adminProcedure
        .input(z.object({
          fileName: z.string(),
          fileData: z.string(), // base64 encoded
          mimeType: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
          const buffer = Buffer.from(input.fileData, 'base64');
          const fileKey = `thumbnails/${ctx.user.id}/${Date.now()}-${input.fileName}`;
          
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          
          return { url, key: fileKey };
        }),
    }),

    categories: router({
      list: adminProcedure.query(async () => {
        return await db.getAllCategories();
      }),

      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createCategory(input);
          return { id };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateCategory(id, data);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteCategory(input.id);
          return { success: true };
        }),
    }),

    tags: router({
      list: adminProcedure.query(async () => {
        return await db.getAllTags();
      }),

      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
        }))
        .mutation(async ({ input }) => {
          const id = await db.createTag(input);
          return { id };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await db.updateTag(id, data);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteTag(input.id);
          return { success: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
