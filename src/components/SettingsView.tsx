import React, { useState } from 'react';
import { School, Clock, MapPin, User, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { SchoolSettings } from '../types';
import { PkbmLogo } from './PkbmLogo';

interface SettingsViewProps {
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {savedSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-700 text-white px-4 py-3 shadow-md border border-emerald-600 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <p className="text-xs font-medium">Pengaturan sekolah dan jam presensi berhasil diperbarui!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Sekolah */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <School className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Identitas Sekolah & Pimpinan</h3>
              <p className="text-xs text-slate-500">
                Informasi ini akan tercetak pada kop surat laporan dan rekap kehadiran
              </p>
            </div>
          </div>

          {/* Logo Preview */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
            <PkbmLogo size={54} className="shrink-0" />
            <div className="text-xs">
              <span className="inline-block rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white mb-1">
                Logo Resmi Terpasang
              </span>
              <p className="font-semibold text-slate-800">
                Logo Resmi PKBM Menara (Desa Langgea Kec. Ranomeeto)
              </p>
              <p className="text-[11px] text-slate-500">
                Tampil di header sistem dan kop surat resmi cetak rekapitulasi presensi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Nama Satuan Pendidikan / Sekolah</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
              <input
                type="text"
                required
                value={formData.schoolNPSN}
                onChange={(e) => setFormData({ ...formData, schoolNPSN: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Alamat Lengkap Sekolah</label>
              <input
                type="text"
                required
                value={formData.schoolAddress}
                onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Kepala Sekolah & Gelar</label>
              <input
                type="text"
                required
                value={formData.headmasterName}
                onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                required
                value={formData.headmasterNip}
                onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Jadwal Jam Presensi & Keterlambatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jadwal Jam Kerja & Aturan Keterlambatan</h3>
              <p className="text-xs text-slate-500">
                Sistem akan otomatis menandai status "Terlambat" jika guru absen setelah waktu toleransi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Jam Masuk Standar</label>
              <input
                type="time"
                required
                value={formData.workStartTime}
                onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Contoh: 07:00</span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Batas Toleransi Keterlambatan
              </label>
              <input
                type="time"
                required
                value={formData.lateThresholdTime}
                onChange={(e) => setFormData({ ...formData, lateThresholdTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Lewat jam ini = Status Terlambat
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Jam Kepulangan Guru</label>
              <input
                type="time"
                required
                value={formData.workEndTime}
                onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Contoh: 15:30</span>
            </div>
          </div>
        </div>

        {/* Validasi Lokasi Sekolah */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Radius Lokasi Sekolah (Geofencing)</h3>
              <p className="text-xs text-slate-500">
                Verifikasi presensi hanya diizinkan di sekitar area sekolah
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Latitude Titik Sekolah</label>
              <input
                type="number"
                step="any"
                value={formData.schoolCoordinates.lat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schoolCoordinates: {
                      ...formData.schoolCoordinates,
                      lat: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Longitude Titik Sekolah</label>
              <input
                type="number"
                step="any"
                value={formData.schoolCoordinates.lng}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schoolCoordinates: {
                      ...formData.schoolCoordinates,
                      lng: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Radius Toleransi (Meter)</label>
              <input
                type="number"
                value={formData.schoolCoordinates.radiusMeters}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schoolCoordinates: {
                      ...formData.schoolCoordinates,
                      radiusMeters: parseInt(e.target.value, 10) || 50,
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Apakah Anda yakin ingin memuat ulang data contoh awal? Ini akan mengembalikan data guru dan catatan contoh.'
                )
              ) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition"
          >
            <RotateCcw className="h-4 w-4" />
            Reset ke Data Awal Contoh
          </button>

          <button
            type="submit"
            id="save-settings-btn"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Save className="h-4 w-4" />
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
