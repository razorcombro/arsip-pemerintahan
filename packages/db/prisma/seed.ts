import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: "SUPER_ADMIN", name: "Super Admin" },
    { code: "ADMIN_INSTANSI", name: "Admin Instansi" },
    { code: "ARSIPARIS", name: "Arsiparis" },
    { code: "OPERATOR_BIDANG", name: "Operator Bidang" },
    { code: "VERIFIKATOR", name: "Verifikator" },
    { code: "PIMPINAN", name: "Pimpinan" },
    { code: "AUDITOR", name: "Auditor" },
    { code: "VIEWER", name: "Viewer" }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role
    });
  }

  const unit = await prisma.unit.upsert({
    where: { code: "DINAS-UTAMA" },
    update: {},
    create: {
      code: "DINAS-UTAMA",
      name: "Dinas Utama"
    }
  });

  const classification = await prisma.classification.upsert({
    where: { code: "UMUM-001" },
    update: {},
    create: {
      code: "UMUM-001",
      name: "Arsip Umum",
      activeRetention: 2,
      inactiveRetention: 3
    }
  });

  console.log("Seed selesai");
  console.log({ unit, classification });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
