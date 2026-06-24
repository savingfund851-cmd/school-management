import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@/src/lib/auth";
import { db, paginate } from "@/src/lib/db";

// GET: All students (Paginated)
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "teacher" && authUser.role !== "superadmin")) {
      return NextResponse.json(
        { error: "Unauthorized. Staff privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const classId = searchParams.get("classId");
    const search = searchParams.get("search") || "";

    const whereClause: any = {};

    if (classId) {
      whereClause.classId = classId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { rollNo: { contains: search } },
      ];
    }

    const paginatedStudents = await paginate(
      db.student,
      {
        where: whereClause,
        include: {
          class: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { rollNo: "asc" },
      },
      { page, limit }
    );

    return NextResponse.json(paginatedStudents);
  } catch (error: any) {
    console.error("Get Students Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST: Register student profile & user account (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      email,
      password,
      name,
      rollNo,
      classId,
      section,
      dob,
      gender,
      guardianName,
      guardianPhone,
      address,
      photoUrl,
    } = body;

    // Validate inputs
    if (!email || !password || !name || !rollNo || !classId || !section) {
      return NextResponse.json(
        { error: "Required fields missing." },
        { status: 400 }
      );
    }

    // Check if email already in use
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user & student profile in a single transaction
    const newStudent = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "student",
        },
      });

      return await tx.student.create({
        data: {
          userId: user.id,
          name,
          rollNo,
          classId,
          section,
          dob: dob || "",
          gender: gender || "Other",
          guardianName: guardianName || "",
          guardianPhone: guardianPhone || "",
          address: address || "",
          photoUrl: photoUrl || null,
          status: "active",
        },
        include: {
          class: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      { message: "Student registered successfully.", student: newStudent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Student Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
