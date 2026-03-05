import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  bingoCard: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getBingoCardsByUser(ctx.user.id);
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getBingoCardById(input.id);
    }),
    create: protectedProcedure.input(z.object({
      title: z.string(),
      description: z.string().optional(),
      gridData: z.any().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createBingoCard({
        userId: ctx.user.id,
        title: input.title,
        description: input.description || null,
        gridData: input.gridData || null,
      });
      return { id };
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      gridData: z.any().optional(),
      swarmMode: z.enum(["chorus", "ensemble", "squadron"]).optional(),
      animationLevel: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateBingoCard(id, data as any);
      return { success: true };
    }),
  }),

  petition: router({
    list: publicProcedure.query(async () => {
      return db.getAllPetitions();
    }),
    create: protectedProcedure.input(z.object({
      title: z.string(),
      description: z.string().optional(),
      bingoCardId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createPetition({
        userId: ctx.user.id,
        title: input.title,
        description: input.description || null,
        bingoCardId: input.bingoCardId || null,
      });
      return { id };
    }),
    endorse: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.endorsePetition(input.id);
      return { success: true };
    }),
  }),

  news: router({
    list: publicProcedure.query(async () => {
      return db.getRecentNews();
    }),
    create: protectedProcedure.input(z.object({
      title: z.string(),
      content: z.string().optional(),
      category: z.string().optional(),
      source: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createNewsItem(input);
      return { id };
    }),
  }),

  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPreferences(ctx.user.id);
    }),
    update: protectedProcedure.input(z.object({
      commPreference: z.enum(["voice", "text", "notices"]).optional(),
      animationLevel: z.number().optional(),
      swarmMode: z.enum(["chorus", "ensemble", "squadron"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.upsertUserPreferences({
        userId: ctx.user.id,
        ...input,
      } as any);
      return { success: true };
    }),
  }),

  chat: router({
    history: protectedProcedure.input(z.object({
      avatarId: z.string(),
    })).query(async ({ ctx, input }) => {
      return db.getChatHistory(ctx.user.id, input.avatarId);
    }),
    send: protectedProcedure.input(z.object({
      avatarId: z.string(),
      message: z.string(),
    })).mutation(async ({ ctx, input }) => {
      await db.addChatMessage({
        userId: ctx.user.id,
        avatarId: input.avatarId,
        message: input.message,
        isFromAvatar: 0,
      });
      // Generate a simple avatar response
      const responses: Record<string, string> = {
        pm: "I've noted that. Let me check the project timeline and get back to you with a status update.",
        sm: "I'm scanning the current situation. Let me assess the context and provide real-time insights.",
        companion: "I hear you. Let's work through this together — what matters most to you right now?",
        sot: "Let me check the baseline records and institutional memory for relevant context.",
        igag: "I think I know someone who can help with that. Let me make a connection.",
        voc: "I sense something important here. Trust your instincts — what does your gut tell you?",
        angel: "Take a breath. Consider what your better nature would counsel in this moment.",
        qa: "I'll run a quality check on that. Let me verify against our protocols.",
        journalist: "Interesting development. Let me cross-reference with intelligence from other initiatives.",
        sw: "On it. The swarm is mobilizing to execute on this task.",
        wg: "Drawing from lived experience... this reminds me of a pattern I've seen before.",
      };
      const avatarResponse = responses[input.avatarId] || "I understand. Let me think about that and get back to you.";
      await db.addChatMessage({
        userId: ctx.user.id,
        avatarId: input.avatarId,
        message: avatarResponse,
        isFromAvatar: 1,
      });
      return { response: avatarResponse };
    }),
  }),
});

export type AppRouter = typeof appRouter;
