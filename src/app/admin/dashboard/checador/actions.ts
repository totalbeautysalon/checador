"use server";
import { revalidatePath } from "next/cache";
import { db, collection, addDoc, updateDoc, doc, query, where, getDocs, Timestamp, orderBy } from "@/lib/firebase";
import { auth } from "@/auth";

import { WORKERS } from "@/lib/constants";

export async function clockIn(workerId: string, photoBase64: string) {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Check if already clocked in today without clocking out
    const q = query(
      collection(db, "attendances"),
      where("checkIn", ">=", today)
    );
    const existing = await getDocs(q);
    const isOpen = existing.docs.some(doc => 
      doc.data().workerId === workerId && doc.data().checkOut === null
    );

    if (isOpen) {
      return { success: false, error: "Ya tienes un registro de entrada abierto hoy." };
    }

    const session = await auth();
    const worker = WORKERS.find(w => w.id === workerId);
    const workerName = worker?.user?.name || session?.user?.name || "Colaboradora";
    
    await addDoc(collection(db, "attendances"), {
      workerId,
      workerName,
      checkIn: new Date(),
      checkOut: null,
      photoIn: photoBase64,
      photoOut: null
    });

    revalidatePath("/admin/dashboard/checador");
    revalidatePath("/admin/dashboard/asistencias");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function clockOut(attendanceId: string, photoBase64: string) {
  try {
    const ref = doc(db, "attendances", attendanceId);
    await updateDoc(ref, {
      checkOut: new Date(),
      photoOut: photoBase64
    });

    revalidatePath("/admin/dashboard/checador");
    revalidatePath("/admin/dashboard/asistencias");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
