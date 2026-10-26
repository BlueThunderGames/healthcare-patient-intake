import bcrypt from "bcrypt";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { Role } from "../generated/prisma/client.js";

const staffSeedSchema = z
  .object({
    clinicianEmail: z.email(),
    clinicianPassword: z.string().min(8),
    adminEmail: z.email(),
    adminPassword: z.string().min(8),
  })
  .refine((values) => values.clinicianEmail !== values.adminEmail, {
    message: "Clinician and administrator emails must be different",
  });

async function upsertStaffUser(
  email: string,
  password: string,
  role: Extract<Role, "CLINICIAN" | "ADMIN">,
) {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { role },
    create: {
      email,
      passwordHash,
      role,
    },
  });
}

async function seed() {
  const config = staffSeedSchema.parse({
    clinicianEmail: env.SEED_CLINICIAN_EMAIL,
    clinicianPassword: env.SEED_CLINICIAN_PASSWORD,
    adminEmail: env.SEED_ADMIN_EMAIL,
    adminPassword: env.SEED_ADMIN_PASSWORD,
  });

  await Promise.all([
    upsertStaffUser(
      config.clinicianEmail,
      config.clinicianPassword,
      "CLINICIAN",
    ),
    upsertStaffUser(config.adminEmail, config.adminPassword, "ADMIN"),
  ]);

  console.log("Staff accounts seeded.");
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
