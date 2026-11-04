import { db, collection, query, where, getDocs, orderBy } from "@/lib/firebase";
import { WORKERS } from "@/lib/constants";
import AsistenciasClient from "./AsistenciasClient";

export const dynamic = 'force-dynamic';

export default async function AsistenciasPage() {
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

  // Get all attendances to simplify
  const qAll = query(collection(db, "attendances"), orderBy("checkIn", "desc"));
  const snapshot = await getDocs(qAll);
  
  const allAttendances = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      workerId: data.workerId,
      worker: { user: { name: data.workerName || 'Desconocido' } },
      checkIn: data.checkIn?.toDate ? data.checkIn.toDate().toISOString() : new Date(data.checkIn).toISOString(),
      checkOut: data.checkOut ? (data.checkOut?.toDate ? data.checkOut.toDate().toISOString() : new Date(data.checkOut).toISOString()) : null,
      photoIn: data.photoIn,
      photoOut: data.photoOut,
      reviewed: data.reviewed || false
    };
  });

  const attendancesThisWeek = allAttendances.filter(a => {
    const d = new Date(a.checkIn);
    return d >= qStart && d <= qEnd;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight mb-1 sm:mb-2">Historial de Asistencias</h1>
        <p className="text-pink-400 text-xs sm:text-sm lg:text-base">Horas trabajadas y registros de entrada/salida del equipo.</p>
      </div>

      <AsistenciasClient 
        workers={WORKERS as any} 
        attendancesThisWeek={attendancesThisWeek} 
        allAttendances={allAttendances}
        weekStart={qStart.toISOString()}
        weekEnd={qEnd.toISOString()}
      />
    </div>
  );
}
