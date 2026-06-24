import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: All classes — public endpoint (used for home page result lookup)
export async function GET(req: NextRequest) {
  try {
    const classes = await db.class.findMany({
      orderBy: { name: "asc" },
      include: {
        teacher: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(classes);
  } catch (error: any) {
    console.error("Get Classes Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
