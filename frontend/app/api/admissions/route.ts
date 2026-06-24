import { NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET: Fetch all admission applications (Admin only)
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req as any);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const admissions = await db.admission.findMany({
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json(admissions);
  } catch (error: any) {
    console.error("Get Admissions Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST: Submit online admission form (Public endpoint)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const applicantName = formData.get("applicantName") as string;
    const dob = formData.get("dob") as string;
    const applyingClass = formData.get("applyingClass") as string;
    const guardianName = formData.get("guardianName") as string;
    const guardianPhone = formData.get("guardianPhone") as string;
    const email = formData.get("email") as string;
    const documentFile = formData.get("document") as File | null;

    if (!applicantName || !dob || !applyingClass || !guardianName || !guardianPhone || !email) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    let documentsUrl = null;

    if (documentFile && documentFile.size > 0) {
      // Validate file type
      const ext = path.extname(documentFile.name).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".pdf"].includes(ext)) {
        return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and PDF are allowed." }, { status: 400 });
      }

      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), "public/uploads/admissions");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}

      // Generate unique filename
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      // Save file
      const buffer = Buffer.from(await documentFile.arrayBuffer());
      await writeFile(filePath, buffer);

      // Store relative URL
      documentsUrl = `/uploads/admissions/${fileName}`;
    }

    const admission = await db.admission.create({
      data: {
        applicantName,
        dob,
        applyingClass,
        guardianName,
        guardianPhone,
        email,
        documentsUrl,
        status: "pending",
      },
    });

    return NextResponse.json({ message: "Admission application submitted successfully.", applicationId: admission.id }, { status: 201 });
  } catch (error: any) {
    console.error("Submit Admission Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
