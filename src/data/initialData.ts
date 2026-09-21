import { Teacher, AttendanceRecord, SchoolSettings } from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'PKBM Menara',
  schoolNPSN: 'P9954430',
  schoolAddress: 'Desa Langgea, Kec. Ranomeeto, Kab. Konawe Selatan, Sulawesi Tenggara',
  headmasterName: 'Dr. H. Muhammad Arifin, M.Pd.',
  headmasterNip: '19680512 199303 1 004',
  workStartTime: '07:00',
  lateThresholdTime: '07:15',
  workEndTime: '15:30',
  schoolCoordinates: {
    lat: -6.229746,
    lng: 106.807493,
    radiusMeters: 100,
  },
  requirePhoto: true,
  requireJournal: false,
};

export const INITIAL_TEACHERS: Teacher[] = [];

// Helper to get formatted today date
export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper for past dates
export const getRelativeDateString = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateInitialAttendance = (): AttendanceRecord[] => {
  return [];
};
