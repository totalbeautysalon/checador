import ConfigClient from "./ConfigClient";
import { WORKERS } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight mb-1 sm:mb-2">Configuración</h1>
        <p className="text-pink-400 text-xs sm:text-sm lg:text-base">Ajustes generales del sistema.</p>
      </div>

      <ConfigClient workers={WORKERS} />
    </div>
  );
}
