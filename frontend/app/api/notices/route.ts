import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: Fetch notices — public notices (targetRole="all") visible without login
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const publicOnly = searchParams.get("public") === "true";

    let roleFilter: string[] = ["all"];

    if (!publicOnly && authUser) {
      if (authUser.role === "admin" || authUser.role === "superadmin") {
        roleFilter = ["all", "teacher", "student"];
      } else if (authUser.role === "teacher") {
        roleFilter = ["all", "teacher"];
      } else if (authUser.role === "student") {
        roleFilter = ["all", "student"];
      }
    }

    const notices = await db.notice.findMany({
      where: {
        isActive: true,
        targetRole: { in: roleFilter },
      },
      include: {
        publishedBy: {
          select: { email: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: publicOnly ? 6 : undefined,
    });

    return NextResponse.json(notices);
  } catch (error: any) {
    console.error("Get Notices Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Create a notice (Admin, SuperAdmin or Teacher)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "teacher" && authUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized. Staff access required." }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, targetRole } = body;

    if (!title || !content || !targetRole) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    if (!["all", "teacher", "student"].includes(targetRole)) {
      return NextResponse.json({ error: "Invalid targetRole specified." }, { status: 400 });
    }

    const notice = await db.notice.create({
      data: {
        title,
        content,
        targetRole,
        publishedById: authUser.userId,
      },
    });

    return NextResponse.json({ message: "Notice published successfully.", notice });
  } catch (error: any) {
    console.error("Create Notice Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
