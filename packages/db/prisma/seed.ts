import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../../.env") });

import { prisma } from "../src/index.js";

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: "extensivo-2026" },
    update: {},
    create: {
      slug: "extensivo-2026",
      title: "Extensivo 2026",
      description: "Curso completo para o ENEM e principais vestibulares",
      type: "extensivo",
      price_cents: 45000,
      access_days: 365,
      is_active: true,
      is_featured: true,
    },
  });

  const module = await prisma.courseModule.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      course_id: course.id,
      title: "Matemática — Módulo 1",
      subject: "Matemática",
      order_index: 1,
    },
  });

  await prisma.courseLesson.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      module_id: module.id,
      course_id: course.id,
      title: "Funções do 1º Grau",
      order_index: 1,
      is_preview: true,
    },
  });

  console.log("Seed concluído ✓");
  console.log(`  Curso: ${course.title} (${course.slug})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
