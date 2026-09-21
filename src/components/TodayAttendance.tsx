import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Camera,
  MapPin,
  ChevronRight,
  LogOut,
  Sparkles,
  Info,
  BookOpen,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import { Teacher, AttendanceRecord, SchoolSettings, AttendanceStatus } from '../types';
import {
  getStatusBadgeConfig,
  getTodayDateString,
  getCurrentWitaTimeHHMM,
} from '../utils/attendanceUtils';
import { CameraCaptureModal } from './CameraCaptureModal';
import { PhotoPreviewModal } from './PhotoPreviewModal';

export const PKBM_SUBJECTS = [
  'Pemberdayaan',
  'Ekonomi',
  'Sosiologi',
  'Sejarah',
  'Geografi',
  'Muatan Lokal',
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'IPA',
  'IPS',
  'Pendidikan Pancasila (PKn)',
  'Informatika / Komputer',
  'Keterampilan / Vokasi',
  'Seni Budaya',
  'PJOK / Olahraga',
  'Pendidikan Agama',
];

interface TodayAttendanceProps {
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (record: AttendanceRecord) => void;
  onCheckOut: (recordId: string, time: string) => void;
  settings: SchoolSettings;
  onNavigateToTeachers?: () => void;
}

export const TodayAttendance: React.FC<TodayAttendanceProps> = ({
  teachers,
  attendanceRecords,
  onSaveAttendance,
  onCheckOut,
  settings,
  onNavigateToTeachers,
}) => {
  const todayStr = getTodayDateString();

  // Selected teacher for recording
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [attendanceType, setAttendanceType] = useState<'masuk' | 'pulang'>('masuk');
  const [status, setStatus] = useState<AttendanceStatus>('hadir');
  const [subject, setSubject] = useState<string>('');
  const [isManualSubject, setIsManualSubject] = useState<boolean>(false);
  const [teachingJournal, setTeachingJournal] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [previewPhotoRecord, setPreviewPhotoRecord] = useState<{
    record: AttendanceRecord;
    teacher?: Teacher;
  } | null>(null);

  // Filter for today's table
  const [tableSearch, setTableSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inspectRecord, setInspectRecord] = useState<{
    teacher: Teacher;
    record?: AttendanceRecord;
  } | null>(null);

  // Map today's attendance by teacher ID
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
  const recordsByTeacherId = new Map<string, AttendanceRecord>();
  todayRecords.forEach((r) => recordsByTeacherId.set(r.teacherId, r));

  // Current live time formatted HH:mm in WITA
  const getCurrentTimeHHMM = () => {
    return getCurrentWitaTimeHHMM();
  };

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const selectedTeacherRecord = selectedTeacherId ? recordsByTeacherId.get(selectedTeacherId) : undefined;

  // Handle teacher selection
  const handleSelectTeacher = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    const existing = recordsByTeacherId.get(teacherId);
    const teacherObj = teachers.find((t) => t.id === teacherId);
    if (existing) {
      if (!existing.checkOutTime) {
        setAttendanceType('pulang');
      } else {
        setAttendanceType('masuk');
      }
      setSubject(existing.subject || teacherObj?.subject || '');
    } else {
      setAttendanceType('masuk');
      setStatus('hadir');
      setSubject(teacherObj?.subject || '');
    }
    setCapturedPhoto(null);
    setIsManualSubject(false);
    setNotes('');
    setTeachingJournal('');
  };

  // Submit attendance
  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const currentTime = getCurrentTimeHHMM();

    if (attendanceType === 'pulang' && selectedTeacherRecord) {
      onCheckOut(selectedTeacherRecord.id, currentTime);
      showToast(`Presensi pulang berhasil dicatat untuk ${selectedTeacher.name}`);
      resetForm();
      return;
    }

    // Determine actual status (if status was Hadir, check if current time > lateThresholdTime)
    let finalStatus: AttendanceStatus = status;
    if (status === 'hadir') {
      const [currH, currM] = currentTime.split(':').map(Number);
      const [lateH, lateM] = settings.lateThresholdTime.split(':').map(Number);
      const currentTotalM = currH * 60 + currM;
      const lateTotalM = lateH * 60 + lateM;

      if (currentTotalM > lateTotalM) {
        finalStatus = 'terlambat';
      }
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      date: todayStr,
      checkInTime: currentTime,
      checkOutTime: null,
      status: finalStatus,
      notes: notes.trim() || undefined,
      photo: capturedPhoto || undefined,
      location: 'Lingkungan PKBM Menara (Desa Langgea)',
      subject: subject.trim() || selectedTeacher.subject || undefined,
      teachingJournal: teachingJournal.trim() || undefined,
    };

    onSaveAttendance(newRecord);
    showToast(`Presensi ${getStatusBadgeConfig(finalStatus).label} berhasil disimpan!`);
    resetForm();
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const resetForm = () => {
    setSelectedTeacherId('');
    setSubject('');
    setIsManualSubject(false);
    setCapturedPhoto(null);
    setNotes('');
    setTeachingJournal('');
    setStatus('hadir');
    setAttendanceType('masuk');
  };

  // Quick check out directly from table
  const handleQuickCheckOut = (teacher: Teacher, record: AttendanceRecord) => {
    const time = getCurrentTimeHHMM();
    onCheckOut(record.id, time);
    showToast(`Presensi pulang pukul ${time} berhasil dicatat untuk ${teacher.name}`);
  };

  // Calculation for summary cards
  const totalActiveTeachers = teachers.filter((t) => t.isActive).length;
  const presentCount = todayRecords.filter((r) => r.status === 'hadir').length;
  const lateCount = todayRecords.filter((r) => r.status === 'terlambat').length;
  const permissionCount = todayRecords.filter(
    (r) => r.status === 'izin' || r.status === 'sakit' || r.status === 'dinas_luar' || r.status === 'cuti'
  ).length;
  const notCheckedInCount = Math.max(0, totalActiveTeachers - (presentCount + lateCount + permissionCount));
  const attendancePercentage = totalActiveTeachers > 0
    ? Math.round(((presentCount + lateCount) / totalActiveTeachers) * 100)
    : 0;

  // Filtered teachers list for today's table
  const filteredTeachers = teachers.filter((t) => {
    if (!t.isActive) return false;
    const matchesSearch =
      t.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.nip.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(tableSearch.toLowerCase());

    if (!matchesSearch) return false;

    const rec = recordsByTeacherId.get(t.id);

    if (statusFilter === 'all') return true;
    if (statusFilter === 'present') return rec && (rec.status === 'hadir' || rec.status === 'terlambat');
    if (statusFilter === 'ontime') return rec && rec.status === 'hadir';
    if (statusFilter === 'late') return rec && rec.status === 'terlambat';
    if (statusFilter === 'permission')
      return rec && (rec.status === 'izin' || rec.status === 'sakit' || rec.status === 'dinas_luar' || rec.status === 'cuti');
    if (statusFilter === 'absent') return !rec;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-800 text-white px-4 py-3 shadow-xl animate-fade-in border border-emerald-600">
          <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0" />
          <p className="text-xs font-medium">{successToast}</p>
        </div>
      )}

      {/* Notice if No Teachers are registered */}
      {teachers.length === 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Belum Ada Data Guru / Tutor PKBM Menara</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Data guru demo lama telah dibersihkan. Silakan tambahkan data tenaga pendidik PKBM Menara untuk mulai mencatat presensi harian.
              </p>
            </div>
          </div>
          {onNavigateToTeachers && (
            <button
              type="button"
              onClick={onNavigateToTeachers}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition whitespace-nowrap"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Kelola Data Guru
            </button>
          )}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tingkat Kehadiran</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{attendancePercentage}%</span>
            <span className="text-[11px] text-slate-500">hari ini</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tepat Waktu</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700">{presentCount}</span>
            <span className="text-[11px] text-slate-500">guru hadir</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Sebelum {settings.lateThresholdTime}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Terlambat</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-700">{lateCount}</span>
            <span className="text-[11px] text-slate-500">guru</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Setelah {settings.lateThresholdTime}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Izin / Sakit / Tugas</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-indigo-700">{permissionCount}</span>
            <span className="text-[11px] text-slate-500">guru</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Dengan surat / disposisi</p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Belum Presensi</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-700">{notCheckedInCount}</span>
            <span className="text-[11px] text-slate-500">guru</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Dari {totalActiveTeachers} total guru</p>
        </div>
      </div>

      {/* Main Grid: Left Form & Right Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Form Pencatatan Presensi */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  Form Presensi Guru
                </h2>
                <p className="text-[11px] text-slate-500">Catat jam masuk, pulang & kegiatan</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                <MapPin className="h-3 w-3" />
                GPS Sekolah Aktif
              </div>
            </div>

            <form onSubmit={handleSubmitAttendance} className="space-y-4">
              {/* 1. Pilih Guru */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Pilih Guru / Tenaga Pendidik <span className="text-rose-500">*</span>
                </label>
                <select
                  id="teacher-select-dropdown"
                  value={selectedTeacherId}
                  onChange={(e) => handleSelectTeacher(e.target.value)}
                  required
                  disabled={teachers.length === 0}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {teachers.length === 0
                      ? '-- Belum ada data guru terdaftar --'
                      : '-- Cari atau Pilih Nama Guru --'}
                  </option>
                  {teachers
                    .filter((t) => t.isActive)
                    .map((teacher) => {
                      const rec = recordsByTeacherId.get(teacher.id);
                      let statusText = '(Belum Presensi)';
                      if (rec) {
                        statusText = rec.checkOutTime
                          ? `(Selesai Pulang ${rec.checkOutTime})`
                          : `(Masuk ${rec.checkInTime} - ${getStatusBadgeConfig(rec.status).label})`;
                      }
                      return (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} — {teacher.subject} {statusText}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Status Info Box if Teacher is selected */}
              {selectedTeacher && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedTeacher.avatar}
                      alt={selectedTeacher.name}
                      className="h-10 w-10 rounded-full object-cover border border-white shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{selectedTeacher.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        NIP/NUPTK: {selectedTeacher.nip} • {selectedTeacher.subject}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-medium text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                        Status: {selectedTeacher.employmentStatus}
                      </span>
                    </div>
                  </div>

                  {selectedTeacherRecord ? (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Jam Masuk Tercatat</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {selectedTeacherRecord.checkInTime} WITA ({getStatusBadgeConfig(selectedTeacherRecord.status).label})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Jam Pulang</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {selectedTeacherRecord.checkOutTime ? `${selectedTeacherRecord.checkOutTime} WITA` : 'Belum'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 rounded-lg p-1.5 border border-amber-200">
                      Guru ini belum melakukan presensi masuk hari ini.
                    </p>
                  )}
                </div>
              )}

              {/* 2. Jenis Presensi (Masuk / Pulang) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Jenis Presensi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="btn-presensi-masuk"
                    onClick={() => setAttendanceType('masuk')}
                    disabled={!!(selectedTeacherRecord && selectedTeacherRecord.checkOutTime)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      attendanceType === 'masuk'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Absen Masuk
                  </button>
                  <button
                    type="button"
                    id="btn-presensi-pulang"
                    onClick={() => setAttendanceType('pulang')}
                    disabled={!selectedTeacherRecord}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      attendanceType === 'pulang'
                        ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Absen Pulang
                  </button>
                </div>
              </div>

              {/* 3. Status Kehadiran (hanya jika Absen Masuk) */}
              {attendanceType === 'masuk' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Kategori Kehadiran
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatus('hadir')}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-medium text-left border transition ${
                        status === 'hadir'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ✓ Hadir Mengajar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('izin')}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-medium text-left border transition ${
                        status === 'izin'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ✉ Izin
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('sakit')}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-medium text-left border transition ${
                        status === 'sakit'
                          ? 'bg-blue-50 border-blue-500 text-blue-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ✚ Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('dinas_luar')}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-medium text-left border transition ${
                        status === 'dinas_luar'
                          ? 'bg-purple-50 border-purple-500 text-purple-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ✈ Tugas / Dinas Luar
                    </button>
                  </div>
                </div>
              )}

              {/* Pilihan Mata Pelajaran */}
              {attendanceType === 'masuk' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                      Pilihan Mata Pelajaran
                    </label>
                    {selectedTeacher?.subject && subject !== selectedTeacher.subject && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualSubject(false);
                          setSubject(selectedTeacher.subject);
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-medium"
                      >
                        Reset ke Mapel Pokok
                      </button>
                    )}
                  </div>

                  {!isManualSubject ? (
                    <div className="relative">
                      <select
                        value={subject}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsManualSubject(true);
                            setSubject('');
                          } else {
                            setSubject(e.target.value);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden appearance-none pr-8 cursor-pointer"
                      >
                        <option value="">-- Pilih Mata Pelajaran --</option>
                        {selectedTeacher?.subject && !PKBM_SUBJECTS.includes(selectedTeacher.subject) && (
                          <option value={selectedTeacher.subject}>
                            {selectedTeacher.subject} (Mapel Pokok)
                          </option>
                        )}
                        {PKBM_SUBJECTS.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub} {selectedTeacher?.subject === sub ? '(Mapel Pokok)' : ''}
                          </option>
                        ))}
                        <option value="__custom__">✎ Ketik Manual Mata Pelajaran Lain...</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Ketik mata pelajaran..."
                        className="w-full rounded-xl border border-blue-400 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualSubject(false);
                          setSubject(selectedTeacher?.subject || '');
                        }}
                        className="shrink-0 px-2.5 py-2 text-[11px] rounded-xl border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        Pilih Dropdown
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Jurnal / Materi Pembelajaran (jika Hadir / Terlambat) */}
              {attendanceType === 'masuk' && (status === 'hadir' || status === 'terlambat') && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Jurnal / Materi Pembelajaran (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={teachingJournal}
                    onChange={(e) => setTeachingJournal(e.target.value)}
                    placeholder="Catatan materi yang diajarkan atau kegiatan belajar hari ini..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Catatan / Alasan jika Izin / Sakit / Dinas */}
              {attendanceType === 'masuk' && status !== 'hadir' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Keterangan Alasan / Disposisi <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    placeholder="Tuliskan alasan izin/sakit/tugas dinas..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              {/* 5. Foto Bukti Presensi / Selfie */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Foto Bukti Kehadiran
                  </label>
                  {capturedPhoto && (
                    <button
                      type="button"
                      onClick={() => setCapturedPhoto(null)}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                {capturedPhoto ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100 flex items-center justify-center">
                    <img
                      src={capturedPhoto}
                      alt="Selfie Presensi"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="absolute bottom-2 right-2 bg-black/60 text-white rounded-md px-2 py-1 text-[10px] font-medium backdrop-blur-xs hover:bg-black/80"
                    >
                      Ganti Foto
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    id="open-camera-btn"
                    onClick={() => {
                      if (!selectedTeacher) {
                        alert('Silakan pilih nama guru terlebih dahulu.');
                        return;
                      }
                      setIsCameraOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-xs font-medium text-slate-600 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 transition"
                  >
                    <Camera className="h-4 w-4" />
                    Ambil Foto / Selfie Verifikasi
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-attendance-btn"
                disabled={!selectedTeacherId}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {attendanceType === 'pulang' ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    Simpan Presensi Pulang (Selesai)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Simpan Presensi Masuk
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Live Table of Today's Attendance */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Daftar Kehadiran Guru Hari Ini
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {todayRecords.length} / {totalActiveTeachers} Terdata
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Pantau jam masuk, jam kepulangan, dan status mengajar per guru
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIP, mapel..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
              {[
                { id: 'all', label: 'Semua Guru' },
                { id: 'present', label: `Hadir (${presentCount + lateCount})` },
                { id: 'ontime', label: `Tepat Waktu (${presentCount})` },
                { id: 'late', label: `Terlambat (${lateCount})` },
                { id: 'permission', label: `Izin/Sakit (${permissionCount})` },
                { id: 'absent', label: `Belum Presensi (${notCheckedInCount})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    statusFilter === pill.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Guru & NIP/NUPTK</th>
                    <th className="py-2.5 px-3">Mata Pelajaran</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Jam Masuk</th>
                    <th className="py-2.5 px-3">Jam Pulang</th>
                    <th className="py-2.5 px-3 text-center">Foto Selfie</th>
                    <th className="py-2.5 px-3">Jurnal & Keterangan</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500 text-xs">
                        <p className="font-semibold text-slate-700">Belum Ada Data Guru / Tutor</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tambahkan data guru PKBM Menara untuk mulai memantau kehadiran harian.
                        </p>
                        {onNavigateToTeachers && (
                          <button
                            type="button"
                            onClick={onNavigateToTeachers}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Tambah Data Guru
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        Tidak ada data guru yang cocok dengan pencarian / filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher) => {
                      const record = recordsByTeacherId.get(teacher.id);
                      const statusConfig = record
                        ? getStatusBadgeConfig(record.status)
                        : {
                            label: 'Belum Presensi',
                            bg: 'bg-slate-100 text-slate-500 border-slate-200',
                            dot: 'bg-slate-400',
                          };

                      const currentSubject = record?.subject || teacher.subject || '-';

                      return (
                        <tr
                          key={teacher.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={teacher.avatar}
                                alt={teacher.name}
                                className="h-8 w-8 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <p className="font-semibold text-slate-800 leading-snug">
                                  {teacher.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {teacher.nip}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Mata Pelajaran */}
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-slate-800 block text-xs">
                              {currentSubject}
                            </span>
                          </td>

                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium border ${statusConfig.bg}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                              {statusConfig.label}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                            {record?.checkInTime ? `${record.checkInTime} WITA` : '-'}
                          </td>

                          <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                            {record?.checkOutTime ? (
                              <span className="text-emerald-700 font-semibold">
                                {record.checkOutTime} WITA
                              </span>
                            ) : record ? (
                              <span className="text-slate-400 text-[11px] italic">Di Sekolah</span>
                            ) : (
                              '-'
                            )}
                          </td>

                          {/* Foto Selfie Thumbnail */}
                          <td className="py-2.5 px-3 text-center">
                            {record?.photo ? (
                              <button
                                type="button"
                                onClick={() => setPreviewPhotoRecord({ record, teacher })}
                                title="Klik untuk melihat bukti foto selfie"
                                className="group/photo relative inline-flex items-center justify-center rounded-lg border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-500 transition shadow-2xs"
                              >
                                <img
                                  src={record.photo}
                                  alt={`Selfie ${teacher.name}`}
                                  className="h-9 w-9 object-cover"
                                />
                                <span className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition text-white">
                                  <Camera className="h-3.5 w-3.5" />
                                </span>
                              </button>
                            ) : (
                              <span className="text-slate-300 text-[10px] italic">-</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 max-w-xs">
                            {record ? (
                              <span className="text-[11px] text-slate-600 truncate block">
                                {record.teachingJournal || record.notes || '-'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* If already checked in and not checked out, offer quick check out */}
                              {record && !record.checkOutTime && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickCheckOut(teacher, record)}
                                  title="Catat Jam Pulang Guru"
                                  className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                                >
                                  <LogOut className="h-3 w-3" />
                                  Pulang
                                </button>
                              )}

                              {/* Inspect details */}
                              <button
                                type="button"
                                onClick={() => setInspectRecord({ teacher, record })}
                                title="Lihat Detail Presensi"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail / Inspect Record */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={inspectRecord.teacher.avatar}
                  alt={inspectRecord.teacher.name}
                  className="h-11 w-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{inspectRecord.teacher.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{inspectRecord.teacher.nip}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mata Pelajaran:</span>
                <span className="font-semibold text-slate-800">
                  {inspectRecord.record?.subject || inspectRecord.teacher.subject}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status Kepegawaian:</span>
                <span className="font-medium text-slate-800">
                  {inspectRecord.teacher.employmentStatus}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status Presensi Hari Ini:</span>
                <span className="font-semibold text-slate-800">
                  {inspectRecord.record
                    ? getStatusBadgeConfig(inspectRecord.record.status).label
                    : 'Belum Presensi'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Jam Masuk:</span>
                <span className="font-mono font-medium text-slate-800">
                  {inspectRecord.record?.checkInTime ? `${inspectRecord.record.checkInTime} WITA` : '-'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Jam Pulang:</span>
                <span className="font-mono font-medium text-slate-800">
                  {inspectRecord.record?.checkOutTime ? `${inspectRecord.record.checkOutTime} WITA` : '-'}
                </span>
              </div>

              {inspectRecord.record?.teachingJournal && (
                <div className="py-1 border-b border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Jurnal / Materi Diajar:</span>
                  <p className="font-medium text-slate-800 leading-relaxed">
                    {inspectRecord.record.teachingJournal}
                  </p>
                </div>
              )}

              {inspectRecord.record?.notes && (
                <div className="py-1 border-b border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Keterangan / Alasan:</span>
                  <p className="font-medium text-slate-800">{inspectRecord.record.notes}</p>
                </div>
              )}

              {inspectRecord.record?.photo && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Foto Bukti Selfie:</span>
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={inspectRecord.record.photo}
                      alt="Bukti Selfie"
                      className="w-full object-cover max-h-48"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (inspectRecord.record) {
                          setPreviewPhotoRecord({
                            record: inspectRecord.record,
                            teacher: inspectRecord.teacher,
                          });
                        }
                      }}
                      className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition font-medium text-xs gap-1.5"
                    >
                      <Camera className="h-4 w-4" />
                      Perbesar Foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setInspectRecord(null)}
                className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhotoRecord && (
        <PhotoPreviewModal
          isOpen={!!previewPhotoRecord}
          onClose={() => setPreviewPhotoRecord(null)}
          record={previewPhotoRecord.record}
          teacher={previewPhotoRecord.teacher}
        />
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(photoUrl) => setCapturedPhoto(photoUrl)}
        teacherName={selectedTeacher?.name || 'Guru'}
      />
    </div>
  );
};
