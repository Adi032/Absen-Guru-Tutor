import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Percent,
  Camera,
  Table,
  LayoutGrid,
  Eye,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { AttendanceRecord, SchoolSettings, Teacher } from '../types';
import {
  exportAttendanceToCSV,
  formatIndonesianDate,
  getStatusBadgeConfig,
  getTodayDateString,
  getRelativeDateString,
} from '../utils/attendanceUtils';
import { PkbmLogo } from './PkbmLogo';
import { PhotoPreviewModal } from './PhotoPreviewModal';

interface AttendanceReportProps {
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  settings: SchoolSettings;
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({
  teachers,
  attendanceRecords,
  settings,
}) => {
  const todayStr = getTodayDateString();
  const [dateRangePreset, setDateRangePreset] = useState<
    'today' | 'last7' | 'thisMonth' | 'all' | 'custom'
  >('last7');
  const [customStartDate, setCustomStartDate] = useState<string>(getRelativeDateString(-7));
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [onlyWithPhoto, setOnlyWithPhoto] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'selfie_gallery'>('table');
  const [previewPhotoRecord, setPreviewPhotoRecord] = useState<{
    record: AttendanceRecord;
    teacher?: Teacher;
  } | null>(null);

  // Calculate filtered date range
  const { startDate, endDate } = useMemo(() => {
    if (dateRangePreset === 'today') {
      return { startDate: todayStr, endDate: todayStr };
    }
    if (dateRangePreset === 'last7') {
      return { startDate: getRelativeDateString(-7), endDate: todayStr };
    }
    if (dateRangePreset === 'thisMonth') {
      const now = new Date();
      const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      return { startDate: firstDay, endDate: todayStr };
    }
    if (dateRangePreset === 'custom') {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    // all
    return { startDate: '2020-01-01', endDate: '2099-12-31' };
  }, [dateRangePreset, customStartDate, customEndDate, todayStr]);

  // Filtered attendance records
  const filteredRecords = useMemo(() => {
    return attendanceRecords
      .filter((rec) => {
        // Date filter
        if (rec.date < startDate || rec.date > endDate) {
          return false;
        }
        // Status filter
        if (selectedStatus !== 'all' && rec.status !== selectedStatus) {
          return false;
        }
        // Teacher filter
        if (selectedTeacherId !== 'all' && rec.teacherId !== selectedTeacherId) {
          return false;
        }
        // Only with photo filter
        if (onlyWithPhoto && !rec.photo) {
          return false;
        }
        // Keyword search
        if (searchKeyword.trim()) {
          const q = searchKeyword.toLowerCase();
          const teacher = teachers.find((t) => t.id === rec.teacherId);
          const matchName = rec.teacherName.toLowerCase().includes(q);
          const matchNip = teacher?.nip.toLowerCase().includes(q) || false;
          const matchSubject =
            (rec.subject || teacher?.subject || '').toLowerCase().includes(q);
          const matchJournal = (rec.teachingJournal || '').toLowerCase().includes(q);
          if (!matchName && !matchNip && !matchSubject && !matchJournal) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.checkInTime.localeCompare(b.checkInTime));
  }, [
    attendanceRecords,
    startDate,
    endDate,
    selectedStatus,
    selectedTeacherId,
    onlyWithPhoto,
    searchKeyword,
    teachers,
  ]);

  // Records that specifically have photos
  const recordsWithPhoto = useMemo(() => {
    return filteredRecords.filter((r) => Boolean(r.photo));
  }, [filteredRecords]);

  // Analytical stats from filtered data
  const totalEntries = filteredRecords.length;
  const onTimeCount = filteredRecords.filter((r) => r.status === 'hadir').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'terlambat').length;
  const leaveCount = filteredRecords.filter(
    (r) =>
      r.status === 'izin' ||
      r.status === 'sakit' ||
      r.status === 'dinas_luar' ||
      r.status === 'cuti'
  ).length;
  const selfieCount = recordsWithPhoto.length;
  const presentRate =
    totalEntries > 0 ? Math.round(((onTimeCount + lateCount) / totalEntries) * 100) : 0;

  // Handle Export CSV
  const handleExportCSV = () => {
    exportAttendanceToCSV(
      filteredRecords,
      teachers,
      settings,
      `Rekap Presensi Guru (${startDate} s/d ${endDate})`
    );
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Non-print Controls & Filters */}
      <div className="print:hidden space-y-4">
        {/* Header Bar with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Rekapitulasi Kehadiran & Jurnal Guru
            </h2>
            <p className="text-xs text-slate-500">
              Laporan data absensi terverifikasi, jurnal mengajar, dan bukti foto selfie
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 shadow-2xs transition"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              Ekspor Excel (CSV)
            </button>
            <button
              id="print-report-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition"
            >
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>

        {/* View Mode Toggle (Tabel vs Rekapan Foto Selfie) */}
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Table className="h-4 w-4" />
              Tabel Rekapitulasi Presensi
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  viewMode === 'table' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {filteredRecords.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('selfie_gallery')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                viewMode === 'selfie_gallery'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Camera className="h-4 w-4" />
              Rekapan Hasil Foto Selfie
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  viewMode === 'selfie_gallery'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {selfieCount}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 pr-2 text-xs text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Mode tampilan aktif:{' '}
            <strong className="text-slate-800">
              {viewMode === 'table' ? 'Tabel Lengkap' : 'Galeri Bukti Foto Selfie'}
            </strong>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="h-3.5 w-3.5 text-emerald-600" />
              Filter Laporan & Rekapan
            </div>

            {/* Checkbox: Hanya dengan foto */}
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={onlyWithPhoto}
                onChange={(e) => setOnlyWithPhoto(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Hanya tampilkan yang memiliki foto selfie
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Rentang Waktu Preset */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Periode Waktu
              </label>
              <select
                value={dateRangePreset}
                onChange={(e) => setDateRangePreset(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              >
                <option value="today">Hari Ini</option>
                <option value="last7">7 Hari Terakhir</option>
                <option value="thisMonth">Bulan Ini</option>
                <option value="all">Semua Riwayat</option>
                <option value="custom">Kustom Tanggal...</option>
              </select>
            </div>

            {/* 2. Filter Status */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Status Kehadiran
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              >
                <option value="all">Semua Status Kehadiran</option>
                <option value="hadir">Hadir (Tepat Waktu)</option>
                <option value="terlambat">Terlambat</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="dinas_luar">Tugas / Dinas Luar</option>
                <option value="cuti">Cuti</option>
              </select>
            </div>

            {/* 3. Filter Guru */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Guru / Tutor
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              >
                <option value="all">Semua Guru & Tutor ({teachers.length})</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Search Keyword */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Cari Guru / Mata Pelajaran
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Ketik nama guru, mata pelajaran..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Custom Date Picker Inputs */}
          {dateRangePreset === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Analytics Snapshot Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Percent className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Tingkat Hadir</span>
              <span className="text-lg font-bold text-slate-900">{presentRate}%</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Tepat Waktu</span>
              <span className="text-lg font-bold text-emerald-700">{onTimeCount}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Terlambat</span>
              <span className="text-lg font-bold text-amber-700">{lateCount}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Izin/Sakit/Dinas</span>
              <span className="text-lg font-bold text-indigo-700">{leaveCount}</span>
            </div>
          </div>

          {/* Clickable Selfie Counter Card */}
          <button
            type="button"
            onClick={() => setViewMode('selfie_gallery')}
            className="col-span-2 sm:col-span-1 bg-blue-50/70 hover:bg-blue-100/70 p-3.5 rounded-xl border border-blue-200/80 shadow-2xs flex items-center gap-3 text-left transition"
            title="Klik untuk membuka Rekapan Foto Selfie"
          >
            <div className="rounded-lg bg-blue-600 p-2 text-white shadow-2xs">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-blue-700 font-semibold block">
                Foto Selfie
              </span>
              <span className="text-lg font-bold text-blue-950">
                {selfieCount} <span className="text-[11px] font-normal text-blue-700">foto</span>
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Printable Report Wrapper (Both regular and print view) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Printable Official Kop Surat Sekolah */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4">
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-center">
            <PkbmLogo size={64} className="shrink-0" />
            <div className="flex-1 max-w-xl text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Pusat Kegiatan Belajar Masyarakat
              </p>
              <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900">
                {settings.schoolName}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                NPSN: <strong>{settings.schoolNPSN}</strong> • {settings.schoolAddress}
              </p>
            </div>
            <div className="w-16 hidden sm:block" />
          </div>
          <div className="mt-3 text-xs font-semibold uppercase text-slate-800 tracking-wide border-t border-slate-200 pt-2 text-center">
            {viewMode === 'table'
              ? 'Laporan Rekapitulasi Presensi & Jurnal Kehadiran Guru'
              : 'Lembar Rekapan Hasil Foto Selfie Presensi Guru / Tutor'}
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Periode:{' '}
            <strong>
              {formatIndonesianDate(startDate)} s/d {formatIndonesianDate(endDate)}
            </strong>
          </p>
        </div>

        {/* 1. TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 print:border-slate-400">
            <table className="w-full text-left text-xs text-slate-700 print:text-[10px]">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200 print:bg-slate-100">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Hari & Tanggal</th>
                  <th className="py-2.5 px-3">Nama Guru & NIP/NUPTK</th>
                  <th className="py-2.5 px-3">Mata Pelajaran</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Masuk</th>
                  <th className="py-2.5 px-3">Pulang</th>
                  <th className="py-2.5 px-3 text-center">Foto Selfie</th>
                  <th className="py-2.5 px-3">Jurnal & Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada catatan kehadiran yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec, index) => {
                    const teacher = teachers.find((t) => t.id === rec.teacherId);
                    const statusObj = getStatusBadgeConfig(rec.status);
                    const subjectDisplay = rec.subject || teacher?.subject || '-';

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/70 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{index + 1}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                          {formatIndonesianDate(rec.date)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{rec.teacherName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            NIP/NUPTK: {teacher?.nip || '-'}
                          </div>
                        </td>

                        {/* Mata Pelajaran */}
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {subjectDisplay}
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${statusObj.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusObj.dot}`} />
                            {statusObj.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                          {rec.checkInTime ? `${rec.checkInTime} WITA` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                          {rec.checkOutTime ? `${rec.checkOutTime} WITA` : '-'}
                        </td>

                        {/* Foto Selfie */}
                        <td className="py-2.5 px-3 text-center">
                          {rec.photo ? (
                            <button
                              type="button"
                              onClick={() => setPreviewPhotoRecord({ record: rec, teacher })}
                              title="Klik untuk melihat bukti foto selfie"
                              className="group/thumb relative inline-flex items-center justify-center rounded-lg border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-500 transition shadow-2xs"
                            >
                              <img
                                src={rec.photo}
                                alt={`Selfie ${rec.teacherName}`}
                                className="h-8 w-8 object-cover print:h-6 print:w-6"
                              />
                              <span className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition text-white print:hidden">
                                <Camera className="h-3 w-3" />
                              </span>
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[10px] italic">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 max-w-xs text-[11px]">
                          <span className="text-slate-600">
                            {rec.teachingJournal || rec.notes || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. REKAPAN HASIL FOTO SELFIE VIEW (Galeri Foto) */}
        {viewMode === 'selfie_gallery' && (
          <div className="space-y-4">
            {recordsWithPhoto.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                  <Camera className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Belum Ada Hasil Foto Selfie pada Periode Ini
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Foto selfie otomatis tersimpan saat guru melakukan presensi dengan kamera aktif.
                  Coba ubah filter rentang tanggal atau pilih periode waktu yang lebih luas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDateRangePreset('all');
                    setOnlyWithPhoto(false);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm transition"
                >
                  Tampilkan Semua Periode
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 print:hidden">
                  <p className="text-xs text-slate-600">
                    Menampilkan <strong>{recordsWithPhoto.length}</strong> bukti foto selfie guru
                    terverifikasi
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Klik kartu atau tombol perbesar untuk melihat foto resolusi penuh & mengunduh
                  </p>
                </div>

                {/* Grid of Selfie Photo Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-3">
                  {recordsWithPhoto.map((rec) => {
                    const teacher = teachers.find((t) => t.id === rec.teacherId);
                    const statusObj = getStatusBadgeConfig(rec.status);
                    const subjectDisplay = rec.subject || teacher?.subject || '-';

                    return (
                      <div
                        key={rec.id}
                        className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all print:border-slate-400 print:shadow-none"
                      >
                        {/* Photo Display */}
                        <div className="relative bg-slate-900 aspect-4/3 overflow-hidden">
                          <img
                            src={rec.photo}
                            alt={`Foto Presensi ${rec.teacherName}`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Time & Status Overlay Badges */}
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-sm ${statusObj.bg}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${statusObj.dot}`} />
                              {statusObj.label}
                            </span>

                            <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                              {rec.checkInTime} WITA
                            </span>
                          </div>

                          {/* Date Overlay at bottom */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                            <span>{formatIndonesianDate(rec.date)}</span>
                            {rec.checkOutTime && (
                              <span className="text-emerald-400 font-mono">
                                Pulang: {rec.checkOutTime}
                              </span>
                            )}
                          </div>

                          {/* Interactive Hover Button to Open Modal */}
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoRecord({ record: rec, teacher })}
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition font-semibold text-xs print:hidden"
                          >
                            <Eye className="h-4 w-4" />
                            Pratinjau Penuh
                          </button>
                        </div>

                        {/* Card Info Details */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 text-xs">
                          <div>
                            <h4 className="font-bold text-slate-900 leading-tight">
                              {rec.teacherName}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              NIP/NUPTK: {teacher?.nip || '-'}
                            </p>
                          </div>

                          {/* Meta details: Mapel */}
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <BookOpen className="h-3 w-3 text-blue-600 shrink-0" />
                              <span className="text-slate-500">Mapel:</span>
                              <span className="font-medium text-slate-900 truncate">
                                {subjectDisplay}
                              </span>
                            </div>
                          </div>

                          {/* Jurnal or Notes */}
                          {(rec.teachingJournal || rec.notes) && (
                            <p className="text-[10px] text-slate-600 line-clamp-2 italic bg-white px-1">
                              "{rec.teachingJournal || rec.notes}"
                            </p>
                          )}

                          {/* Card Action Button */}
                          <div className="pt-1 print:hidden">
                            <button
                              type="button"
                              onClick={() => setPreviewPhotoRecord({ record: rec, teacher })}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition"
                            >
                              <Camera className="h-3.5 w-3.5" />
                              Lihat Foto & Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Printable Signature Section (Ranomeeto) */}
        <div className="mt-8 pt-4 hidden print:flex justify-end text-xs">
          <div className="text-right min-w-[240px]">
            <p>Ranomeeto, {formatIndonesianDate(todayStr)}</p>
            <p className="font-semibold">Kepala {settings.schoolName}</p>
            <div className="h-20" />
            <p className="font-bold underline">{settings.headmasterName}</p>
            <p className="font-mono text-[11px]">
              {settings.headmasterNip ? `NIP. ${settings.headmasterNip}` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* High-Resolution Photo Preview Modal */}
      {previewPhotoRecord && (
        <PhotoPreviewModal
          isOpen={!!previewPhotoRecord}
          onClose={() => setPreviewPhotoRecord(null)}
          record={previewPhotoRecord.record}
          teacher={previewPhotoRecord.teacher}
        />
      )}
    </div>
  );
};
