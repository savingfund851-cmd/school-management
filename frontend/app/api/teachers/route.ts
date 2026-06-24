import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthUser } from "@/src/lib/auth";
import { db, paginate } from "@/src/lib/db";

// GET: All teachers (Paginated)
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "admin" && authUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { employeeId: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    const paginatedTeachers = await paginate(
      db.teacher,
      {
        where: whereClause,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { name: "asc" },
      },
      { page, limit }
    );

    return NextResponse.json(paginatedTeachers);
  } catch (error: any) {
    console.error("Get Teachers Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST: Add new teacher profile (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || authUser.role !== "admin" && authUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password, name, employeeId, subject, phone, address } = body;

    if (!email || !password || !name || !employeeId || !subject) {
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

    // Check if employee ID already in use
    const existingTeacher = await db.teacher.findUnique({
      where: { employeeId },
    });
    if (existingTeacher) {
      return NextResponse.json(
        { error: "Teacher with this Employee ID already exists." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and teacher profile in a transaction
    const newTeacher = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "teacher",
        },
      });

      return await tx.teacher.create({
        data: {
          userId: user.id,
          name,
          employeeId,
          subject,
          phone: phone || "",
          address: address || "",
          status: "active",
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      { message: "Teacher registered successfully.", teacher: newTeacher },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Teacher Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
