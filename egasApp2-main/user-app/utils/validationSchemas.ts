import { z } from "zod";

export const step1Schema = z.object({
  tankSize: z.string().min(1, "Please select a tank size"),
});

export const step2Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const step3Schema = z.object({
  streetAddress: z.string().min(5, "Street address must be at least 5 characters"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  city: z.string().min(2, "City is required"),
});

export const step4Schema = z.object({
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}); 