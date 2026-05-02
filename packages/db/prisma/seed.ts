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

  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });