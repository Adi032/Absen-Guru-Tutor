import React from 'react';
import { X, Calendar, Clock, BookOpen, MapPin, Download, CheckCircle2 } from 'lucide-react';
import { formatIndonesianDate, getStatusBadgeConfig } from '../utils/attendanceUtils';
import { AttendanceRecord, Teacher } from '../types';

interface PhotoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord;
  teacher?: Teacher;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  isOpen,
  onClose,
  record,
  teacher,
}) => {
  if (!isOpen) return null;

  const statusObj = getStatusBadgeConfig(record.status);
  const subjectDisplay = record.subject || teacher?.subject || 'Umum / Tematik';

  const handleDownload = () => {
    if (!record.photo) return;
    const link = document.createElement('a');
    link.href = record.photo;
    link.download = `Selfie_Presensi_${record.teacherName.replace(/\s+/g, '_')}_${record.date}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bukti Foto Selfie Presensi</h3>
              <p className="text-[11px] text-slate-500 font-medium">PKBM Menara • Terverifikasi Sistem</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            title="Tutup Pratinjau"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Photo Container */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[260px] max-h-[380px] overflow-hidden">
          {record.photo ? (
            <img
              src={record.photo}
              alt={`Foto Selfie ${record.teacherName}`}
              className="max-h-[380px] w-full object-contain"
            />
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada file foto selfie untuk presensi ini.
            </div>
          )}

          {/* Watermark overlay on photo */}
          {record.photo && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/65 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold truncate">{record.teacherName}</span>
                <span className="text-slate-300">• {formatIndonesianDate(record.date)}</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold shrink-0">
                {record.checkInTime} WITA
              </span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-5 space-y-3.5 text-xs">
          {/* Teacher and Status */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{record.teacherName}</h4>
              <p className="text-[11px] text-slate-500 font-mono">
                NIP/NUPTK: {teacher?.nip || '-'} • Status: {teacher?.employmentStatus || 'Guru / Tutor'}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${statusObj.bg}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusObj.dot}`} />
              {statusObj.label}
            </span>
          </div>

          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-0.5">
                <BookOpen className="h-3 w-3 text-blue-600" />
                Mata Pelajaran
              </span>
              <p className="font-semibold text-slate-800 text-xs truncate">{subjectDisplay}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-0.5">
                <Calendar className="h-3 w-3 text-slate-500" />
                Tanggal & Waktu
              </span>
              <p className="font-semibold text-slate-800 text-xs">
                {formatIndonesianDate(record.date)}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                {record.checkInTime} WITA
                {record.checkOutTime ? ` - ${record.checkOutTime}` : ''}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-0.5">
                <MapPin className="h-3 w-3 text-rose-500" />
                Lokasi Presensi
              </span>
              <p className="font-semibold text-slate-800 text-xs truncate">
                {record.location || 'PKBM Menara (Desa Langgea)'}
              </p>
            </div>
          </div>

          {/* Journal / Notes if available */}
          {(record.teachingJournal || record.notes) && (
            <div className="rounded-xl bg-blue-50/50 p-3 border border-blue-100 text-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-0.5">
                {record.teachingJournal ? 'Jurnal / Topik Pembelajaran:' : 'Keterangan Presensi:'}
              </p>
              <p className="text-xs leading-relaxed">
                {record.teachingJournal || record.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {record.photo && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm transition"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh Foto Asli
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white py-2.5 px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
