import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Check, X, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  teacherName: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  teacherName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung oleh peramban ini.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      setCameraError(
        'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan atau gunakan opsi unggah foto.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw image mirror for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add watermark timestamp
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        const now = new Date().toLocaleString('id-ID');
        ctx.fillText(`${teacherName} • ${now}`, 14, canvas.height - 13);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-600" />
              Verifikasi Foto Kehadiran Guru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{teacherName}</p>
          </div>
          <button
            id="close-camera-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center">
            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Foto Presensi"
                className="h-full w-full object-cover"
              />
            ) : cameraError ? (
              <div className="p-6 text-center text-slate-300">
                <AlertCircle className="mx-auto h-12 w-12 text-amber-400 mb-3" />
                <p className="text-sm font-medium text-white mb-2">{cameraError}</p>
                <label className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer shadow">
                  <Camera className="h-4 w-4" />
                  Pilih Foto dari Perangkat
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover -scale-x-100"
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white text-sm">
                    Menghubungkan kamera...
                  </div>
                )}
                {/* Visual target boundary */}
                <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-dashed border-white/50 flex items-center justify-center">
                  <span className="bg-black/50 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-xs">
                    Posisikan wajah di dalam kotak
                  </span>
                </div>
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 cursor-pointer underline">
              <span>Unggah foto manual</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            <div className="flex items-center gap-2">
              {capturedPhoto ? (
                <>
                  <button
                    id="retake-photo-btn"
                    onClick={handleRetake}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Ambil Ulang
                  </button>
                  <button
                    id="confirm-photo-btn"
                    onClick={handleConfirm}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                    Gunakan Foto
                  </button>
                </>
              ) : (
                <button
                  id="snap-photo-btn"
                  onClick={handleTakePhoto}
                  disabled={!!cameraError || isLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                >
                  <Camera className="h-4 w-4" />
                  Ambil Foto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
