import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: All fees (Admin only)
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
    const status = searchParams.get("status");
    
    const whereClause: any = {};
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const fees = await db.fee.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            name: true,
            rollNo: true,
            class: { select: { name: true } }
          }
        }
      },
      orderBy: { dueDate: "asc" }
    });

    return NextResponse.json(fees);
  } catch (error: any) {
    console.error("Get Fees Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST: Add new fee entry for a student (Admin only)
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
    const { studentId, amount, feeType, dueDate } = body;

    if (!studentId || !amount || !feeType || !dueDate) {
      return NextResponse.json(
        { error: "Required fields missing." },
        { status: 400 }
      );
    }

    const fee = await db.fee.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        feeType,
        dueDate: new Date(dueDate),
        status: "unpaid"
      }
    });

    return NextResponse.json(
      { message: "Fee entry created successfully.", fee },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Fee Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// PATCH: Update fee status (Admin only)
export async function PATCH(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || authUser.role !== "admin" && authUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Required fields missing." },
        { status: 400 }
      );
    }

    const data: any = { status };
    if (status === "paid") {
      data.paidDate = new Date();
    } else if (status === "unpaid") {
      data.paidDate = null;
    }

    const fee = await db.fee.update({
      where: { id },
      data
    });

    return NextResponse.json({ message: "Fee status updated.", fee });
  } catch (error: any) {
    console.error("Update Fee Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
