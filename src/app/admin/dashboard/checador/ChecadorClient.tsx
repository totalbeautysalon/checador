"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Camera, 
  Clock, 
  CheckCircle2, 
  User, 
  CameraOff, 
  History, 
  SwitchCamera, 
  Sparkles, 
  RefreshCw,
  Upload,
  AlertCircle,
  Calendar
} from "lucide-react";
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
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"checador" | "historial">("checador");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reloj en tiempo real
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async (mode: "user" | "environment" = facingMode) => {
    setCameraError(null);
    try {
      // Detener stream anterior si existe
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("WEBRTC_UNSUPPORTED");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setFacingMode(mode);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (error: any) {
      console.warn("Camera init issue:", error);
      let errMsg = "No se pudo acceder a la cámara en vivo.";

      if (error?.message === "WEBRTC_UNSUPPORTED" || !navigator?.mediaDevices) {
        errMsg = "El navegador requiere HTTPS o activar la cámara nativa.";
      } else if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        errMsg = "Permiso de cámara bloqueado. Puedes usar la cámara nativa abajo.";
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        errMsg = "No se detectó cámara web. Puedes capturar foto con tu teléfono.";
      } else if (error?.name === 'NotReadableError') {
        errMsg = "La cámara está en uso por otra app (Zoom/WhatsApp).";
      }

      setCameraError(errMsg);
      setStream(null);
    }
  }, [facingMode, stream]);

  // Iniciar cámara al montar
  useEffect(() => {
    startCamera("user");
    return () => {
      stopCamera();
    };
  }, []);

  // Voltear cámara (selfie <-> trasera)
  const toggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    startCamera(nextMode);
  };

  // Captura desde <input type="file" capture="user"> (soporte 100% garantizado en móviles)
  const handleNativeFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar foto en canvas para optimizar tamaño y subida
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.82);
          setCapturedPhoto(compressedBase64);
          toast.success("¡Foto capturada correctamente!");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Captura en vivo desde el video feed
  const captureLivePhoto = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Si es cámara frontal, aplicar espejo para que coincida con la vista
    if (facingMode === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  };

  const getFinalPhoto = (): string | null => {
    if (capturedPhoto) return capturedPhoto;
    if (stream) return captureLivePhoto();
    return null;
  };

  const activeRecord = currentUserId ? attendances.find(a => a.workerId === currentUserId && !a.checkOut) : null;
  const currentWorker = workers.find(w => w.id === currentUserId);
  const progressPercent = Math.min(100, Math.max(0, ((hoursWorked + (minutesWorked / 60)) / targetHours) * 100));
  const myTodayAttendances = attendances.filter(a => a.workerId === currentUserId);

  const handleClockIn = async () => {
    if (!currentUserId) return toast.error("Error de sesión. Recarga la página.");
    
    const photoBase64 = getFinalPhoto();
    if (!photoBase64) {
      if (!stream) {
        // Invocar cámara nativa si la cámara en vivo no está activa
        fileInputRef.current?.click();
        return toast("Toma tu foto de seguridad con la cámara", { icon: "📸" });
      }
      return toast.error("Por favor enciende la cámara o toma una foto.");
    }

    setIsProcessing(true);
    const res = await clockIn(currentUserId, photoBase64);
    if (res.success) {
      toast.success("¡Entrada registrada exitosamente!", { icon: "✅" });
      setCapturedPhoto(null);
      stopCamera();
    } else {
      toast.error(res.error);
    }
    setIsProcessing(false);
  };

  const handleClockOut = async (attendanceId: string) => {
    const photoBase64 = getFinalPhoto();
    if (!photoBase64) {
      if (!stream) {
        fileInputRef.current?.click();
        return toast("Toma tu foto de salida con la cámara", { icon: "📸" });
      }
      return toast.error("Por favor enciende la cámara o toma una foto.");
    }

    setIsProcessing(true);
    const res = await clockOut(attendanceId, photoBase64);
    if (res.success) {
      toast.success("¡Salida registrada exitosamente!", { icon: "👋" });
      setCapturedPhoto(null);
      stopCamera();
    } else {
      toast.error(res.error);
    }
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Input oculto para cámara nativa móvil (fallback infalible) */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        capture="user" 
        onChange={handleNativeFileCapture} 
        className="hidden" 
      />

      {/* ============================================================== */}
      {/* 📱 HEADER SUPERIOR CON RELOJ EN VIVO                          */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border border-zinc-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">
              {currentTime ? format(currentTime, "EEEE, d 'de' MMMM", { locale: es }) : "Cargando..."}
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
              {currentTime ? format(currentTime, "hh:mm:ss a") : "--:--:--"}
            </p>
          </div>
        </div>

        {activeRecord ? (
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-400">Turno Activo</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/40 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">Sin Checar</span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 📱 SELECTOR DE PESTAÑAS MÓVIL (Estilo iOS Segmented Control)    */}
      {/* ============================================================== */}
      <div className="lg:hidden grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-850 rounded-2xl shadow-inner">
        <button
          onClick={() => setMobileTab("checador")}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            mobileTab === "checador"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Marcar Asistencia</span>
        </button>
        <button
          onClick={() => setMobileTab("historial")}
          className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            mobileTab === "historial"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Hoy ({myTodayAttendances.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 📱 / 💻 CONTENEDOR PRINCIPAL: CHECADOR + HISTORIAL              */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
        
        {/* ============================================================ */}
        {/* PANEL IZQUIERDO: VISOR DE CÁMARA Y ACCIÓN DE ASISTENCIA     */}
        {/* ============================================================ */}
        <div className={`bg-zinc-900/90 rounded-3xl p-4 sm:p-6 border border-zinc-800 shadow-2xl flex flex-col gap-4 ${mobileTab === 'historial' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Tarjeta de Saludo y Progreso Quincenal */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Hola, <span className="bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">{userName || currentWorker?.user?.name || "Colaboradora"}</span></span>
                </h2>
                <p className="text-xs text-zinc-400">Captura tu foto de seguridad para registrarte</p>
              </div>
            </div>

            {/* Barra de Progreso Quincenal */}
            <div className="bg-black/80 border border-zinc-800/90 rounded-2xl p-3 shadow-inner">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Progreso de la Quincena</span>
                <span className="text-amber-400 font-black text-sm">
                  {hoursWorked}h {minutesWorked}m <span className="text-zinc-500 font-normal text-xs">/ {targetHours}h</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {progressPercent >= 100 && (
                <p className="text-[11px] text-emerald-400 mt-1.5 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ¡Felicidades! Meta de horas cumplida.
                </p>
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* VISOR DE CÁMARA (Estilo App de Fotos)                     */}
          {/* ========================================================== */}
          <div className="w-full aspect-[4/3] sm:aspect-video max-h-[360px] bg-black rounded-2xl sm:rounded-3xl overflow-hidden relative border-2 border-zinc-800 shadow-inner flex items-center justify-center">
            
            {/* Foto tomada previamente con cámara nativa */}
            {capturedPhoto ? (
              <div className="relative w-full h-full">
                <img 
                  src={capturedPhoto} 
                  alt="Foto capturada" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-3 left-3 bg-emerald-500/90 text-black px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Foto Lista
                </div>
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    startCamera(facingMode);
                  }}
                  className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-zinc-700 backdrop-blur-md active:scale-95 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Tomar otra
                </button>
              </div>
            ) : stream ? (
              // Vista en vivo WebRTC
              <div className="relative w-full h-full">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  suppressHydrationWarning
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                />
                
                {/* Guía de selfie (marco ovalado sutil) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60 border-2 border-dashed border-amber-400/40 rounded-[45%] opacity-60" />
                </div>

                {/* Badge en vivo */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-zinc-700/50 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> En Vivo
                </div>

                {/* Botón para cambiar de cámara (Frontal / Trasera en teléfonos) */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  title="Cambiar de cámara"
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 active:scale-90 text-amber-400 p-2 rounded-xl border border-zinc-700/60 backdrop-blur-md transition shadow-lg"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Estado sin cámara activa
              <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-pink-500">
                  <CameraOff className="w-7 h-7 opacity-70" />
                </div>
                
                {cameraError ? (
                  <div className="max-w-xs">
                    <p className="text-xs text-amber-400 font-semibold mb-1 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Modo Móvil
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-snug">{cameraError}</p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">Enciende la cámara para registrarte</p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => startCamera("user")}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-amber-400 text-xs font-bold rounded-xl flex items-center gap-2 border border-zinc-700 transition"
                  >
                    <Camera className="w-4 h-4" /> En Vivo
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-pink-900/30 transition"
                  >
                    <Upload className="w-4 h-4" /> Cámara Nativa
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} suppressHydrationWarning className="hidden" />
          </div>

          {/* ========================================================== */}
          {/* BOTÓN DE ACCIÓN PRINCIPAL (Thumb-Friendly Grande)          */}
          {/* ========================================================== */}
          <div className="w-full pt-1">
            {activeRecord ? (
              <button 
                type="button"
                onClick={() => handleClockOut(activeRecord.id)}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-50 text-white font-black text-base sm:text-lg rounded-2xl flex justify-center items-center gap-2.5 transition-all shadow-xl shadow-red-950/50 border border-red-500/30 active:scale-[0.98] cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Guardando salida...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-pink-300" />
                    <span>Checar Salida</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleClockIn}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 disabled:opacity-50 text-black font-black text-base sm:text-lg rounded-2xl flex justify-center items-center gap-2.5 transition-all shadow-xl shadow-amber-500/20 border border-amber-300/40 active:scale-[0.98] cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Guardando entrada...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-black" />
                    <span>Checar Entrada</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* PANEL DERECHO: MIS REGISTROS DEL DÍA                         */}
        {/* ============================================================ */}
        <div className={`bg-zinc-900/90 rounded-3xl p-4 sm:p-6 border border-zinc-800 shadow-2xl flex flex-col gap-4 ${mobileTab === 'checador' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
              <History className="w-5 h-5 text-pink-500" />
              <span>Mis Registros de Hoy</span>
            </h2>
            <span className="text-xs font-bold text-zinc-400 bg-black/60 px-2.5 py-1 rounded-xl border border-zinc-800">
              {myTodayAttendances.length} registro{myTodayAttendances.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
            {myTodayAttendances.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-black/40 border border-dashed border-zinc-800">
                <User className="w-10 h-10 mx-auto mb-2 opacity-30 text-pink-500" />
                <p className="text-xs text-zinc-400 font-medium">Aún no tienes registros de asistencia hoy.</p>
                <p className="text-[11px] text-zinc-600 mt-1">Usa la cámara y presiona "Checar Entrada".</p>
              </div>
            ) : (
              myTodayAttendances.map(record => (
                <div key={record.id} className="bg-black/80 p-3.5 sm:p-4 rounded-2xl border border-zinc-800/80 shadow-md flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Entrada */}
                    <div className="bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800/60 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Entrada
                      </span>
                      <span className="font-mono font-bold text-white text-xs sm:text-sm">
                        {record.checkIn ? format(new Date(record.checkIn), "hh:mm a") : "-"}
                      </span>
                      {record.photoIn && (
                        <img 
                          src={record.photoIn} 
                          alt="Foto Entrada" 
                          className="w-full aspect-square object-cover rounded-lg border border-zinc-700/60 mt-1" 
                        />
                      )}
                    </div>

                    {/* Salida */}
                    <div className="bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800/60 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                        Salida
                      </span>
                      <span className="font-mono font-bold text-white text-xs sm:text-sm">
                        {record.checkOut ? format(new Date(record.checkOut), "hh:mm a") : "En curso..."}
                      </span>
                      {record.photoOut ? (
                        <img 
                          src={record.photoOut} 
                          alt="Foto Salida" 
                          className="w-full aspect-square object-cover rounded-lg border border-zinc-700/60 mt-1" 
                        />
                      ) : (
                        <div className="w-full aspect-square rounded-lg border border-dashed border-zinc-800 bg-black/40 flex flex-col items-center justify-center text-amber-400/60 gap-1 mt-1">
                          <Clock className="w-5 h-5 animate-pulse" />
                          <span className="text-[10px]">Activo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
