const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Clear existing data in reverse order of dependencies
  await prisma.fee.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.admission.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Existing data cleared.");

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: "admin@school.com",
      passwordHash: passwordHash,
      role: "admin",
    },
  });
  console.log("Admin user created: admin@school.com");

  // 2. Create Teacher User & Profile
  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@school.com",
      passwordHash: passwordHash,
      role: "teacher",
      teacher: {
        create: {
          name: "Dr. Rahman",
          employeeId: "TCH001",
          subject: "Mathematics",
          phone: "01712345678",
          address: "Dhaka, Bangladesh",
        },
      },
    },
    include: {
      teacher: true,
    },
  });
  console.log("Teacher user and profile created: teacher@school.com");

  // 3. Create Class
  const classObj = await prisma.class.create({
    data: {
      name: "Class 10",
      section: "A",
      academicYear: "2026",
      teacherId: teacherUser.teacher.id,
    },
  });
  console.log("Class created: Class 10-A");

  // 4. Create Student User & Profile
  const studentUser = await prisma.user.create({
    data: {
      email: "student@school.com",
      passwordHash: passwordHash,
      role: "student",
      student: {
        create: {
          name: "Rashfi Rahman",
          rollNo: "101",
          classId: classObj.id,
          section: "A",
          dob: "2010-05-15",
          gender: "Male",
          guardianName: "Amin Rahman",
          guardianPhone: "01812345678",
          address: "Chittagong, Bangladesh",
          status: "active",
        },
      },
    },
  });
  console.log("Student user and profile created: student@school.com");

  // 5. Create some notices
  await prisma.notice.createMany({
    data: [
      {
        title: "Annual Exam Schedule Notice",
        content: "The annual exam schedule has been published. Please check the portal for details.",
        targetRole: "all",
        publishedById: admin.id,
      },
      {
        title: "Staff Meeting on Saturday",
        content: "All teachers are requested to attend the staff meeting on Saturday at 10 AM.",
        targetRole: "teacher",
        publishedById: admin.id,
      }
    ]
  });
  console.log("Sample notices created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
