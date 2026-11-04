"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, Clock, CheckCircle2, User, CameraOff, History } from "lucide-react";
import toast from "react-hot-toast";
import { clockIn, clockOut } from "./actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ChecadorClient({ 
  workers, 
  attendances,
  currentUserId,
  hoursWorked,
  minutesWorked,
  targetHours,
  userName
}: { 
  workers: any[], 
  attendances: any[],
  currentUserId: string,
  hoursWorked: number,
  minutesWorked: number,
  targetHours: number,
  userName?: string
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      if (error.name === 'NotAllowedError') {
        toast.error("Permiso denegado: Ve al candado de la barra de direcciones y permite la cámara.");
      } else if (error.name === 'NotFoundError') {
        toast.error("No se encontró ninguna cámara conectada en esta PC.");
      } else if (error.name === 'NotReadableError') {
        toast.error("La cámara está siendo usada por otra aplicación (ej. Zoom, otra pestaña).");
      } else {
        toast.error(`Error de cámara: ${error.message || error.name}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const activeRecord = currentUserId ? attendances.find(a => a.workerId === currentUserId && !a.checkOut) : null;
  const currentWorker = workers.find(w => w.id === currentUserId);
  const progressPercent = Math.min(100, Math.max(0, ((hoursWorked + (minutesWorked / 60)) / targetHours) * 100));

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      return canvasRef.current.toDataURL('image/jpeg', 0.8);
    }
    return null;
  };

  const handleClockIn = async () => {
    if (!currentUserId) return toast.error("Error de sesión. Recarga la página.");
    if (!stream) return toast.error("La cámara debe estar encendida para tomar tu foto.");
    
    const photoBase64 = capturePhoto();
    if (!photoBase64) return toast.error("Error al capturar la foto.");

    setIsProcessing(true);
    const res = await clockIn(currentUserId, photoBase64);
    if (res.success) {
      toast.success("¡Entrada registrada exitosamente!");
      stopCamera();
    } else {
      toast.error(res.error);
    }
    setIsProcessing(false);
  };

  const handleClockOut = async (attendanceId: string) => {
    if (!stream) return toast.error("La cámara debe estar encendida para registrar tu salida.");
    
    const photoBase64 = capturePhoto();
    if (!photoBase64) return toast.error("Error al capturar la foto.");

    setIsProcessing(true);
    const res = await clockOut(attendanceId, photoBase64);
    if (res.success) {
      toast.success("¡Salida registrada exitosamente!");
      stopCamera();
    } else {
      toast.error(res.error);
    }
    setIsProcessing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 flex-1 min-h-0 pb-8">
      {/* Panel de Checador */}
      <div className="bg-zinc-900 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-pink-900/20 border border-zinc-800 flex flex-col items-center justify-center h-full min-h-0">
        <h2 className="text-lg lg:text-xl font-bold text-amber-500 mb-2 flex items-center gap-2 shrink-0">
          <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-pink-500" /> Hola, {userName || currentWorker?.user?.name || "Colaboradora"}
        </h2>
        <p className="text-zinc-400 text-xs lg:text-sm mb-4 shrink-0">Registra tu asistencia de hoy</p>

        {/* Barra de Progreso */}
        <div className="w-full bg-black border border-zinc-800 rounded-2xl p-3 lg:p-4 mb-4 shadow-inner shadow-black shrink-0">
          <div className="flex justify-between items-end mb-2">
            <span className="text-zinc-400 text-sm">Progreso de la Quincena</span>
            <span className="text-amber-500 font-bold text-lg">{hoursWorked}h {minutesWorked}m <span className="text-xs text-zinc-500 font-normal">/ {targetHours}h</span></span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-amber-500 transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {progressPercent >= 100 && (
            <p className="text-xs text-amber-400 mt-2 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> ¡Has cumplido tu meta de horas!</p>
          )}
        </div>

        <div suppressHydrationWarning className="w-full flex-1 min-h-[150px] bg-black rounded-2xl overflow-hidden relative mb-4 lg:mb-6 border-4 border-zinc-800 shadow-inner shadow-black">
          {!stream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 z-10">
              <CameraOff className="w-16 h-16 mb-4 opacity-50 text-pink-500" />
              <button 
                onClick={startCamera}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold rounded-xl flex items-center gap-2 transition border border-zinc-700 hover:border-pink-500/50"
              >
                <Camera className="w-5 h-5" /> Encender Cámara
              </button>
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            suppressHydrationWarning
            className={`w-full h-full object-cover transform scale-x-[-1] ${!stream ? 'hidden' : ''}`} 
          />
          <canvas ref={canvasRef} suppressHydrationWarning className="hidden" />
        </div>

        <div className="w-full grid grid-cols-1 gap-4 shrink-0">
          {activeRecord ? (
            <button 
              onClick={() => handleClockOut(activeRecord.id)}
              disabled={!currentUserId || !stream || isProcessing}
              className="w-full py-3 lg:py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl flex justify-center items-center gap-2 transition shadow-lg shadow-red-900/30 border border-red-500/30"
            >
              {isProcessing ? "Procesando..." : (
                <><CheckCircle2 className="w-6 h-6 text-pink-400" /> Checar Salida</>
              )}
            </button>
          ) : (
            <button 
              onClick={handleClockIn}
              disabled={!currentUserId || !stream || isProcessing}
              className="w-full py-3 lg:py-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-black text-lg rounded-2xl flex justify-center items-center gap-2 transition shadow-lg shadow-amber-900/30 border border-amber-400/50"
            >
              {isProcessing ? "Procesando..." : (
                <><CheckCircle2 className="w-6 h-6" /> Checar Entrada</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Historial del día */}
      <div className="bg-black rounded-3xl p-6 lg:p-8 border border-zinc-800 shadow-xl shadow-amber-900/5 flex flex-col h-full min-h-0 overflow-hidden">
        <h2 className="text-lg lg:text-xl font-bold text-amber-500 mb-4 flex items-center gap-2 shrink-0">
          <History className="w-5 h-5 lg:w-6 lg:h-6 text-pink-500" /> Autogestión
        </h2>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          {attendances.filter(a => a.workerId === currentUserId).length === 0 ? (
            <div className="text-center text-zinc-600 py-12">
              <User className="w-12 h-12 mx-auto mb-3 opacity-20 text-pink-500" />
              <p>Aún no has registrado entrada hoy.</p>
            </div>
          ) : (
            attendances.filter(a => a.workerId === currentUserId).map(record => (
              <div key={record.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-sm flex flex-col gap-6 hover:border-pink-500/30 transition">
                
                {/* Entrada (Arriba) */}
                {record.photoIn && (
                  <div className="flex flex-col items-center">
                    <p suppressHydrationWarning className="text-sm font-bold text-amber-500 mb-2 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      Entrada: {format(new Date(record.checkIn), "hh:mm a", { locale: es })}
                    </p>
                    <img src={record.photoIn} alt="Entrada" className="w-full max-w-[280px] aspect-square object-cover rounded-2xl border-2 border-zinc-700 shadow-lg" />
                  </div>
                )}

                {/* Salida (Abajo) */}
                {record.photoOut ? (
                  <div className="flex flex-col items-center pt-4 border-t border-zinc-800/50">
                    <p suppressHydrationWarning className="text-sm font-bold text-pink-500 mb-2 uppercase tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                      Salida: {format(new Date(record.checkOut), "hh:mm a")}
                    </p>
                    <img src={record.photoOut} alt="Salida" className="w-full max-w-[280px] aspect-square object-cover rounded-2xl border-2 border-zinc-700 shadow-lg" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-black rounded-2xl border-2 border-dashed border-zinc-800 py-8">
                    <Clock className="w-8 h-8 text-amber-500 mb-2 opacity-50 animate-pulse" />
                    <p className="text-sm text-amber-500 font-medium opacity-70">Turno Activo</p>
                  </div>
                )}
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
