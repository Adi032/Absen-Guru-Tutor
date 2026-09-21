export type AttendanceStatus =
  | 'hadir'
  | 'terlambat'
  | 'sakit'
  | 'izin'
  | 'dinas_luar'
  | 'cuti'
  | 'alpha';

export type EmploymentStatus = 'PNS' | 'PPPK' | 'GTT/Honorer' | 'Guru Tetap';

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  gender: 'L' | 'P';
  subject: string;
  employmentStatus: EmploymentStatus;
  phone: string;
  email?: string;
  avatar: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm
  checkOutTime?: string | null; // HH:mm
  status: AttendanceStatus;
  notes?: string;
  photo?: string; // base64 or photo URL
  location: string;
  teachingJournal?: string; // Catatan kegiatan / jurnal mengajar
  teachingClass?: string; // e.g. "Paket C - Kelas X", "Paket B"
  subject?: string; // Mata Pelajaran yang diajarkan pada sesi ini
}

export interface SchoolSettings {
  schoolName: string;
  schoolNPSN: string;
  schoolAddress: string;
  headmasterName: string;
  headmasterNip: string;
  workStartTime: string; // e.g. "07:00"
  lateThresholdTime: string; // e.g. "07:15"
  workEndTime: string; // e.g. "15:00"
  schoolCoordinates: {
    lat: number;
    lng: number;
    radiusMeters: number;
  };
  requirePhoto: boolean;
  requireJournal: boolean;
}
