import { AttendanceRecord, AttendanceStatus, SchoolSettings, Teacher } from '../types';

export const getTodayDateString = (): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
};

export const getRelativeDateString = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
};

export const getCurrentWitaTimeHHMM = (): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Makassar',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  let h = '00';
  let m = '00';
  for (const p of parts) {
    if (p.type === 'hour') h = p.value;
    if (p.type === 'minute') m = p.value;
  }
  return `${h}:${m}`;
};

export const getWitaLiveClock = (date: Date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  let weekday = '';
  let day = '';
  let month = '';
  let year = '';
  let hours = '00';
  let minutes = '00';
  let seconds = '00';

  for (const p of parts) {
    if (p.type === 'weekday') weekday = p.value;
    if (p.type === 'day') day = p.value;
    if (p.type === 'month') month = p.value;
    if (p.type === 'year') year = p.value;
    if (p.type === 'hour') hours = p.value;
    if (p.type === 'minute') minutes = p.value;
    if (p.type === 'second') seconds = p.value;
  }

  return {
    weekday,
    day,
    month,
    year,
    hours,
    minutes,
    seconds,
    timeString: `${hours}:${minutes}`,
    fullDateString: `${weekday}, ${day} ${month} ${year}`,
  };
};

export const formatIndonesianDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, month, day);

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const dayName = days[dateObj.getDay()];
  const monthName = months[dateObj.getMonth()];
  return `${dayName}, ${day} ${monthName} ${year}`;
};

export const getStatusBadgeConfig = (status: AttendanceStatus) => {
  switch (status) {
    case 'hadir':
      return {
        label: 'Hadir',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'terlambat':
      return {
        label: 'Terlambat',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'sakit':
      return {
        label: 'Sakit',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'izin':
      return {
        label: 'Izin',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'dinas_luar':
      return {
        label: 'Tugas / Dinas Luar',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'cuti':
      return {
        label: 'Cuti',
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-500',
      };
    case 'alpha':
    default:
      return {
        label: 'Tanpa Keterangan',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
  }
};

export const exportAttendanceToCSV = (
  records: AttendanceRecord[],
  teachers: Teacher[],
  settings: SchoolSettings,
  filterTitle = 'Rekap Presensi Guru'
) => {
  const teacherMap = new Map<string, Teacher>();
  teachers.forEach((t) => teacherMap.set(t.id, t));

  const headers = [
    'No',
    'Tanggal',
    'NIP / NUPTK',
    'Nama Guru',
    'Mata Pelajaran',
    'Status Kepegawaian',
    'Status Kehadiran',
    'Jam Masuk',
    'Jam Pulang',
    'Jurnal / Catatan',
    'Lokasi Presensi',
  ];

  const rows = records.map((rec, index) => {
    const teacher = teacherMap.get(rec.teacherId);
    const statusObj = getStatusBadgeConfig(rec.status);
    return [
      (index + 1).toString(),
      `"${rec.date}"`,
      `"${teacher?.nip || '-'}"`,
      `"${rec.teacherName.replace(/"/g, '""')}"`,
      `"${(rec.subject || teacher?.subject || '-').replace(/"/g, '""')}"`,
      `"${teacher?.employmentStatus || '-'}"`,
      `"${statusObj.label}"`,
      `"${rec.checkInTime || '-'}"`,
      `"${rec.checkOutTime || '-'}"`,
      `"${(rec.notes || rec.teachingJournal || '-').replace(/"/g, '""')}"`,
      `"${(rec.location || '-').replace(/"/g, '""')}"`,
    ];
  });

  const titleRow = [`"${settings.schoolName}"`];
  const subTitle = [`"${filterTitle} - Dicetak pada ${new Date().toLocaleString('id-ID')}"`];
  const blankRow = [''];

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel
    [titleRow.join(','), subTitle.join(','), blankRow.join(','), headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Presensi_Guru_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
