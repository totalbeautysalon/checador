"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateTargetHours } from "./actions";
import { Settings, Save, Loader2 } from "lucide-react";
import { db, getDoc, doc } from "@/lib/firebase";

export default function ConfigClient({ workers }: { workers: any[] }) {
  const [hours, setHours] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "hours"));
        const currentHours = settingsDoc.exists() ? settingsDoc.data() : {};
        
        const hoursMap: Record<string, number> = {};
        workers.forEach(w => {
          hoursMap[w.id] = currentHours[w.id] || 96;
        });
        setHours(hoursMap);
      } catch (err) {
        toast.error("Error al cargar configuración");
      }
      setIsLoading(false);
    };
    fetchHours();
  }, [workers]);

  const handleSave = async (workerId: string) => {
    setIsSaving(true);
    const res = await updateTargetHours(workerId, hours[workerId]);
    if (res.success) {
      toast.success("¡Horas actualizadas!");
    } else {
      toast.error(res.error || "Error al guardar");
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-black p-8 rounded-3xl border border-zinc-800 shadow-xl shadow-pink-900/10 max-w-3xl">
      <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-pink-500" />
        Configuración de Horas por Quincena
      </h2>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8 text-amber-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          workers.filter(w => w.user.name !== 'Gerencia').map(worker => (
            <div key={worker.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-200">{worker.user.name}</p>
                <p className="text-sm text-zinc-500">Horas objetivo por quincena</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={hours[worker.id] || 96} 
                  onChange={(e) => setHours({ ...hours, [worker.id]: parseInt(e.target.value) || 0 })}
                  className="w-24 px-4 py-2 bg-black border border-zinc-700 rounded-lg text-white text-center focus:border-amber-500 outline-none"
                />
                <button 
                  onClick={() => handleSave(worker.id)}
                  disabled={isSaving}
                  className="p-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition disabled:opacity-50"
                  title="Guardar"
                >
                  <Save className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
