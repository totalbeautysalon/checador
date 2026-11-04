import { db, collection, query, getDocs, orderBy } from "@/lib/firebase";
import HistorialClient from "./HistorialClient";

export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
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
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight mb-1 sm:mb-2">Historial de Quincenas</h1>
        <p className="text-pink-400 text-xs sm:text-sm lg:text-base">Busca y filtra el historial completo de asistencias por quincena.</p>
      </div>

      <HistorialClient allAttendances={allAttendances} />
    </div>
  );
}
