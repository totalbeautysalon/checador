import ConfigClient from "./ConfigClient";
import { WORKERS } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-amber-500 tracking-tight mb-2">Configuración</h1>
        <p className="text-pink-400 text-lg">Ajustes generales del sistema.</p>
      </div>

      <ConfigClient workers={WORKERS} />
    </div>
  );
}
