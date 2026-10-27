"use server";
import { db, doc, setDoc } from "@/lib/firebase";
import { auth } from "@/auth";

export async function updateTargetHours(workerId: string, hours: number) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      throw new Error("No tienes permisos");
    }

    await setDoc(doc(db, "settings", "hours"), {
      [workerId]: hours
    }, { merge: true });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
