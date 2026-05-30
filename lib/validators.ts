import { z } from "zod";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  pin: z
    .string()
    .regex(/^\d{4,6}$/, "PIN must be between 4 and 6 digits"),
});

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be 20 characters or less")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
    pin: z
      .string()
      .regex(/^\d{4,6}$/, "PIN must be between 4 and 6 digits"),
    gender: z.enum(["boy", "girl"] as const, {
      error: "Please select a gender theme",
    }),
    avatarId: z.string().min(1, "Please select an avatar"),
    yearGroup: z.coerce
      .number()
      .int()
      .min(7, "Year group must be at least Year 7")
      .max(11, "Year group must be at most Year 11"),
    gcseExamDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.yearGroup >= 10) {
        return !!data.gcseExamDate;
      }
      return true;
    },
    {
      message: "GCSE Exam date is required for Year 10 and 11 students",
      path: ["gcseExamDate"],
    }
  );

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
