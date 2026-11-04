"use client";
import { useState } from "react";
import { format, differenceInMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Calendar, Search } from "lucide-react";

export default function HistorialQuincenasClient({ 
  allAttendances 
}: { 
  allAttendances: any[]
}) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedQuincena, setSelectedQuincena] = useState(new Date().getDate() <= 15 ? "1" : "2");

  const year = parseInt(selectedYear);
  const month = parseInt(selectedMonth);
  let qStart, qEnd;

  if (selectedQuincena === "1") {
    qStart = new Date(year, month, 1);
    qEnd = new Date(year, month, 15, 23, 59, 59, 999);
  } else {
    qStart = new Date(year, month, 16);
    qEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  }

  const filteredAttendances = allAttendances.filter(a => {
    const d = new Date(a.checkIn);
    return d >= qStart && d <= qEnd;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Filtros */}
      <div className="bg-black p-4 sm:p-6 rounded-3xl border border-zinc-800 shadow-xl shadow-pink-900/10 flex flex-wrap gap-3 sm:gap-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-zinc-500 text-xs sm:text-sm mb-1">Año</label>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 sm:px-4 py-2 rounded-xl outline-none focus:border-amber-500 text-sm"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-zinc-500 text-xs sm:text-sm mb-1">Mes</label>
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 sm:px-4 py-2 rounded-xl outline-none focus:border-amber-500 text-sm"
          >
            {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto flex-1 min-w-[200px]">
          <label className="block text-zinc-500 text-xs sm:text-sm mb-1">Quincena</label>
          <select 
            value={selectedQuincena} 
            onChange={e => setSelectedQuincena(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white px-3 sm:px-4 py-2 rounded-xl outline-none focus:border-amber-500 text-sm"
          >
            <option value="1">1ra Quincena (1 al 15)</option>
            <option value="2">2da Quincena (16 al Fin de mes)</option>
          </select>
        </div>
      </div>

      {/* Historial General */}
      <div className="bg-black p-6 rounded-3xl border border-zinc-800 shadow-xl shadow-amber-900/10">
        <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-pink-500" />
          Registros de la Quincena
        </h2>

        {filteredAttendances.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30 text-amber-500"/>
            No hay registros en esta quincena.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-pink-500 text-sm">
                  <th className="pb-3 font-medium">Trabajadora</th>
                  <th className="pb-3 font-medium">Día</th>
                  <th className="pb-3 font-medium">Entrada</th>
                  <th className="pb-3 font-medium">Salida</th>
                  <th className="pb-3 font-medium">Tiempo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredAttendances.map(record => {
                  const inTime = new Date(record.checkIn);
                  const outTime = record.checkOut ? new Date(record.checkOut) : null;
                  let durationStr = "-";
                  if (outTime) {
                    const mins = differenceInMinutes(outTime, inTime);
                    durationStr = `${Math.floor(mins/60)}h ${mins%60}m`;
                  }

                  return (
                    <tr key={record.id} className="transition text-sm hover:bg-zinc-900/50">
                      <td className="py-4 font-bold text-zinc-200">
                        {record.worker.user.name}
                      </td>
                      <td className="py-4 text-zinc-400 capitalize">
                        {format(inTime, "EEEE d MMM", { locale: es })}
                      </td>
                      <td className="py-4 font-medium text-zinc-300">
                        {format(inTime, "hh:mm a")}
                      </td>
                      <td className="py-4 font-medium text-zinc-300">
                        {outTime ? format(outTime, "hh:mm a") : <span className="text-amber-500 text-xs px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">Pendiente</span>}
                      </td>
                      <td className="py-4 font-bold text-pink-400">
                        {durationStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
