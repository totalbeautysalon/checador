import ChecadorClient from "./ChecadorClient";
import { db, collection, query, where, getDocs, orderBy, getDoc, doc } from "@/lib/firebase";
import { WORKERS } from "@/lib/constants";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function ChecadorPage() {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id 
      || (session?.user?.name ? WORKERS.find(w => w.user.name.toLowerCase() === session.user.name?.toLowerCase())?.id : null)
      || (session?.user?.role === 'admin' ? '4' : null);

    const today = new Date();
    today.setHours(0,0,0,0);

    const q = query(
      collection(db, "attendances"),
      where("checkIn", ">=", today),
      orderBy("checkIn", "desc")
    );
  
  const snapshot = await getDocs(q);
  
  const attendances = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      workerId: data.workerId,
      worker: { user: { name: data.workerName || 'Desconocido' } },
      checkIn: data.checkIn?.toDate ? data.checkIn.toDate().toISOString() : new Date(data.checkIn).toISOString(),
      checkOut: data.checkOut ? (data.checkOut?.toDate ? data.checkOut.toDate().toISOString() : new Date(data.checkOut).toISOString()) : null,
      photoIn: data.photoIn,
      photoOut: data.photoOut
    };
  });

  // Calculate user fortnight hours
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  let qStart, qEnd;
  if (date <= 15) {
    qStart = new Date(year, month, 1);
    qEnd = new Date(year, month, 15, 23, 59, 59, 999);
  } else {
    qStart = new Date(year, month, 16);
    qEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  }

  const qFortnight = query(
    collection(db, "attendances"),
    where("checkIn", ">=", qStart),
    where("checkIn", "<=", qEnd)
  );
  const fnSnapshot = await getDocs(qFortnight);
  let totalMinutes = 0;
  
  fnSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.workerId === currentUserId && data.checkIn && data.checkOut && data.reviewed) {
      const inT = data.checkIn.toDate ? data.checkIn.toDate() : new Date(data.checkIn);
      const outT = data.checkOut.toDate ? data.checkOut.toDate() : new Date(data.checkOut);
      totalMinutes += Math.floor((outT.getTime() - inT.getTime()) / 60000);
    }
  });

  const hoursWorked = Math.floor(totalMinutes / 60);
  const minutesWorked = totalMinutes % 60;

  // Get target hours
  let targetHours = 96; // default 96 hrs per quincena
  if (currentUserId) {
    const settingsDoc = await getDoc(doc(db, "settings", "hours"));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      if (data[currentUserId]) {
        targetHours = data[currentUserId];
      }
    }
  }
    return (
      <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col">
        <div className="mb-3 sm:mb-4 shrink-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 tracking-tight flex items-center gap-2">
            <span>Checador de Asistencia</span>
            <span className="text-lg">📸</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm lg:text-base">Registra tu entrada y salida capturando tu foto de seguridad.</p>
        </div>

        <ChecadorClient 
          workers={WORKERS} 
          attendances={attendances} 
          currentUserId={currentUserId || ""}
          hoursWorked={hoursWorked}
          minutesWorked={minutesWorked}
          targetHours={targetHours}
          userName={session?.user?.name || ""}
        />
      </div>
    );
  } catch (err: any) {
    console.error("ERROR EN CHECADOR PAGE COMPLETO:", err);
    throw err;
  }
}
