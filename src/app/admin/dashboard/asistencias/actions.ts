"use server";
import { revalidatePath } from "next/cache";
import { db, doc, getDoc, updateDoc } from "@/lib/firebase";

export async function toggleReview(id: string) {
  try {
    const ref = doc(db, "attendances", id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return { success: false, error: "Not found" };

    const data = snapshot.data();
    await updateDoc(ref, {
      reviewed: !data.reviewed
    });

    revalidatePath("/admin/dashboard/asistencias");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
