"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toggleReview } from "./actions";
import { Clock, Calendar, CheckCircle2, AlertCircle, Eye, X } from "lucide-react";

interface Attendance {
  id: string;
  workerId: string;
  checkIn: string;
  checkOut: string | null;
  photoIn: string | null;
  photoOut: string | null;
  reviewed?: boolean;
  worker: { user: { name: string } };
}

export default function AsistenciasClient({
  workers,
  attendancesThisWeek,
  allAttendances,
  weekStart,
  weekEnd
}: {
  workers: any[];
  attendancesThisWeek: Attendance[];
  allAttendances: Attendance[];
  weekStart: string;
  weekEnd: string;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState<string | null>(null);
  const router = useRouter();

  
    const handleReview = async (id: string) => {
      setIsReviewing(id);
      const res = await toggleReview(id); if(!res.success) console.error(res.error); else router.refresh();
      setIsReviewing(null);
    };

  // Calcular horas trabajadas por empleado esta semana
  const hoursPerWorker = workers.map(worker => {
    const workerAttendances = attendancesThisWeek.filter(a => a.workerId === worker.id);
    let totalMinutes = 0;
    let missingCheckouts = 0;

    workerAttendances.forEach(record => {
      if (record.checkIn && record.checkOut) {
        if (record.reviewed) {
          totalMinutes += differenceInMinutes(new Date(record.checkOut), new Date(record.checkIn));
        }
      } else if (!record.checkOut) {
        missingCheckouts++;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      workerId: worker.id,
      name: worker.user.name,
      hours,
      minutes,
      missingCheckouts
    };
  }).sort((a, b) => (b.hours * 60 + b.minutes) - (a.hours * 60 + a.minutes));

  return (
    <div className="space-y-8">
      {/* Resumen de la semana */}
      <div className="bg-black p-4 sm:p-6 rounded-3xl border border-zinc-800 shadow-xl shadow-pink-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-amber-500 flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
            Horas Trabajadas (Esta Quincena)
          </h2>
          <span suppressHydrationWarning className="text-xs sm:text-sm font-medium text-pink-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full w-fit">
            {format(new Date(weekStart), "d MMM", { locale: es })} - {format(new Date(weekEnd), "d MMM", { locale: es })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {hoursPerWorker.map(stat => (
            <div key={stat.workerId} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between hover:border-pink-500/30 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black flex items-center justify-center shadow-md shadow-amber-500/20">
                  {stat.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-zinc-200">{stat.name}</p>
                  {stat.missingCheckouts > 0 && (
                    <p className="text-xs text-red-400 font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {stat.missingCheckouts} turno(s) sin cerrar
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-amber-500">{stat.hours}<span className="text-base text-zinc-500 font-medium">h</span> {stat.minutes}<span className="text-base text-zinc-500 font-medium">m</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial General */}
      <div className="bg-black p-4 sm:p-6 rounded-3xl border border-zinc-800 shadow-xl shadow-amber-900/10">
        <h2 className="text-lg sm:text-xl font-bold text-amber-500 flex items-center gap-2 mb-4 sm:mb-6">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
          Últimos 50 Registros
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              
              <tr className="border-b border-zinc-800 text-pink-500 text-sm">
                <th className="pb-3 font-medium">Trabajadora</th>
                <th className="pb-3 font-medium">Día</th>
                <th className="pb-3 font-medium">Entrada</th>
                <th className="pb-3 font-medium">Salida</th>
                <th className="pb-3 font-medium">Tiempo Total</th>
                <th className="pb-3 font-medium">Fotos</th>
                <th className="pb-3 font-medium text-center">Revisado</th>
              </tr>

            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {allAttendances.map(record => {
                const inTime = new Date(record.checkIn);
                const outTime = record.checkOut ? new Date(record.checkOut) : null;
                let durationStr = "-";
                if (outTime) {
                  const mins = differenceInMinutes(outTime, inTime);
                  durationStr = `${Math.floor(mins/60)}h ${mins%60}m`;
                }

                return (
                  
                  <tr key={record.id} className={`transition text-sm hover:bg-zinc-900/50 ${record.reviewed ? 'bg-amber-900/10' : ''}`}>
                    <td className="py-4 font-bold text-zinc-200">
                      {record.worker.user.name}
                    </td>
                    <td suppressHydrationWarning className="py-4 text-zinc-400 capitalize">
                      {format(inTime, "EEEE d MMM", { locale: es })}
                    </td>
                    <td suppressHydrationWarning className="py-4 font-medium text-zinc-300">
                      {format(inTime, "hh:mm a")}
                    </td>
                    <td suppressHydrationWarning className="py-4 font-medium text-zinc-300">
                      {outTime ? format(outTime, "hh:mm a") : <span className="text-amber-500 text-xs px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">Pendiente</span>}
                    </td>
                    <td className="py-4 font-bold text-pink-400">
                      {durationStr}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        {record.photoIn && (
                          <img 
                            src={record.photoIn} 
                            onClick={() => setSelectedPhoto(record.photoIn)}
                            className="w-10 h-10 object-cover rounded-md border border-zinc-700 cursor-pointer hover:border-pink-500 transition-colors" 
                            title="Ver Foto Entrada"
                          />
                        )}
                        {record.photoOut && (
                          <img 
                            src={record.photoOut} 
                            onClick={() => setSelectedPhoto(record.photoOut)}
                            className="w-10 h-10 object-cover rounded-md border border-zinc-700 cursor-pointer hover:border-pink-500 transition-colors" 
                            title="Ver Foto Salida"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => handleReview(record.id)}
                        disabled={isReviewing === record.id}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition ${record.reviewed ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-amber-400'}`}
                        title={record.reviewed ? "Desmarcar" : "Marcar como revisado"}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>

                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 p-2 rounded-2xl relative max-w-xl w-full shadow-2xl border border-zinc-800">
            <button onClick={() => setSelectedPhoto(null)} className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition">
              <X className="w-6 h-6" />
            </button>
            <img src={selectedPhoto} className="w-full h-auto rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
