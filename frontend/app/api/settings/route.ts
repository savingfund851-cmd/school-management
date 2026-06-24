import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";

// GET: Fetch school settings
export async function GET() {
  try {
    let settings = await db.schoolSettings.findFirst();
    
    // If no settings exist yet, create default
    if (!settings) {
      settings = await db.schoolSettings.create({
        data: {}
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Get Settings Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// PUT: Update school settings
export async function PUT(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || authUser.role !== "admin" && authUser.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    
    let settings = await db.schoolSettings.findFirst();
    if (!settings) {
      settings = await db.schoolSettings.create({
        data: body
      });
    } else {
      settings = await db.schoolSettings.update({
        where: { id: settings.id },
        data: body
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
