import { programRouter } from "@/server/api/routers/program";
import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { studentRouter } from "./routers/student";
import { adminRouter } from "./routers/admin";
import { teacherRouter } from "./routers/teacher";
import { courseRouter } from "./routers/course";
import { enrollmentRouter } from "./routers/enrollment";
import { reportRouter } from "./routers/report";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  program: programRouter,
  user: userRouter,
  student: studentRouter,
  admin: adminRouter,
  teacher: teacherRouter,
  course: courseRouter,
  enrollment: enrollmentRouter,
  report: reportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
