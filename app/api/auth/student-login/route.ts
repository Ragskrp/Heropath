import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { setSessionCookie } from "@/lib/session";
import { LoginSchema, RegisterSchema } from "@/lib/validators";
import { StudentProfile } from "@/types/auth";
import { StudentProgress } from "@/types/progress";
import bcrypt from "bcrypt";

export const runtime = "nodejs";

const BCRYPT_SALT_ROUNDS = 10;

export async function POST(request: Request) {
  try {
    const adminDb = getAdminDb();
    const body = await request.json();
    const { action } = body;

    if (action === "login") {
      const parsed = LoginSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
      }

      const { username, pin } = parsed.data;
      const lowerUsername = username.toLowerCase();

      // Find user in Firestore
      const snapshot = await adminDb
        .collection("students")
        .where("username", "==", lowerUsername)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      const studentDoc = snapshot.docs[0];
      if (!studentDoc) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      const studentData = studentDoc.data() as StudentProfile;

      // Verify PIN
      const isPinValid = await bcrypt.compare(pin, studentData.pinHash);
      if (!isPinValid) {
        return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
      }

      // Update lastLoginAt
      const lastLoginAt = new Date().toISOString();
      await studentDoc.ref.update({ lastLoginAt });

      // Create JWE Session
      await setSessionCookie({
        uid: studentData.uid,
        username: studentData.username,
        gender: studentData.gender,
        theme: studentData.theme,
        avatarId: studentData.avatarId,
        yearGroup: studentData.yearGroup,
        gcseExamDate: studentData.gcseExamDate,
      });

      return NextResponse.json({ success: true, profile: { ...studentData, lastLoginAt } });
    }

    if (action === "register") {
      const parsed = RegisterSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
      }

      const { username, pin, gender, avatarId, yearGroup, gcseExamDate } = parsed.data;
      const lowerUsername = username.toLowerCase();

      // Check if username already exists
      const existingSnapshot = await adminDb
        .collection("students")
        .where("username", "==", lowerUsername)
        .limit(1)
        .get();

      if (!existingSnapshot.empty) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
      }

      // Hash the PIN code
      const pinHash = await bcrypt.hash(pin, BCRYPT_SALT_ROUNDS);

      // Create profile document reference
      const studentRef = adminDb.collection("students").doc();
      const uid = studentRef.id;

      const profile: StudentProfile = {
        uid,
        username: lowerUsername,
        pinHash,
        gender,
        theme: gender === "boy" ? "marvel" : "princess",
        avatarId,
        yearGroup,
        ...(yearGroup >= 10 && gcseExamDate ? { gcseExamDate } : {}),
        xp: 0,
        level: 1,
        streak: 0,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const progress: StudentProgress = {
        uid,
        completedQuests: {},
        topicMastery: {},
        badges: [],
      };

      // Transactionally save student and initial progress
      const batch = adminDb.batch();
      batch.set(studentRef, profile);
      batch.set(adminDb.collection("progress").doc(uid), progress);
      await batch.commit();

      // Set JWE Session
      await setSessionCookie({
        uid,
        username: profile.username,
        gender: profile.gender,
        theme: profile.theme,
        avatarId: profile.avatarId,
        yearGroup: profile.yearGroup,
        gcseExamDate: profile.gcseExamDate,
      });

      return NextResponse.json({ success: true, profile });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Auth route error:", err);
    return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
  }
}
