/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Teacher, AttendanceRecord, SchoolSettings } from './types';
import {
  INITIAL_TEACHERS,
  INITIAL_SCHOOL_SETTINGS,
  generateInitialAttendance,
  getTodayDateString,
} from './data/initialData';
import { Header } from './components/Header';
import { TodayAttendance } from './components/TodayAttendance';
import { AttendanceReport } from './components/AttendanceReport';
import { TeacherManagement } from './components/TeacherManagement';
import { SettingsView } from './components/SettingsView';

const STORAGE_KEYS = {
  TEACHERS: 'absen_guru_teachers_v1',
  RECORDS: 'absen_guru_records_v1',
  SETTINGS: 'absen_guru_settings_v1',
};

// IDs of the old demo teachers from the initial template
const OLD_DEMO_TEACHER_IDS = new Set([
  't-1',
  't-2',
  't-3',
  't-4',
  't-5',
  't-6',
  't-7',
  't-8',
  't-9',
  't-10',
]);

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'report' | 'teachers' | 'settings'>('today');

  // Load state from localStorage or initialize with clean data
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (saved) {
        const parsed: Teacher[] = JSON.parse(saved);
        // Clean out any old demo teachers from previous template
        const filtered = parsed.filter((t) => !OLD_DEMO_TEACHER_IDS.has(t.id));
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error('Failed to load teachers from storage:', e);
    }
    return INITIAL_TEACHERS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) {
        const parsed: AttendanceRecord[] = JSON.parse(saved);
        // Clean out records belonging to old demo teachers
        const filtered = parsed.filter(
          (r) =>
            !OLD_DEMO_TEACHER_IDS.has(r.teacherId) &&
            !r.id.startsWith('att-today-') &&
            !r.id.startsWith('att-yest-') &&
            !r.id.startsWith('att-2d-')
        );
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error('Failed to load attendance records from storage:', e);
    }
    return generateInitialAttendance();
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed: SchoolSettings = JSON.parse(saved);
        if (
          parsed.schoolName === 'SMA Negeri 1 Teladan Nusantara' ||
          !parsed.schoolNPSN ||
          parsed.schoolNPSN === '20108921' ||
          parsed.schoolAddress?.includes('Kebayoran Baru')
        ) {
          const updated = {
            ...parsed,
            schoolName: 'PKBM Menara',
            schoolNPSN: 'P9954430',
            schoolAddress: 'Desa Langgea, Kec. Ranomeeto, Kab. Konawe Selatan, Sulawesi Tenggara',
          };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load settings from storage:', e);
    }
    return INITIAL_SCHOOL_SETTINGS;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [settings]);

  // Handlers for attendance
  const handleSaveAttendance = (newRecord: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      // If record for same teacher and date already exists, update it
      const existingIndex = prev.findIndex(
        (r) => r.teacherId === newRecord.teacherId && r.date === newRecord.date
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...newRecord,
        };
        return updated;
      }
      return [newRecord, ...prev];
    });
  };

  const handleCheckOut = (recordId: string, checkOutTime: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, checkOutTime } : r))
    );
  };

  // Handlers for teachers
  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
    );
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    setAttendanceRecords((prev) => prev.filter((r) => r.teacherId !== teacherId));
  };

  // Handler for settings
  const handleSaveSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
  };

  // Handler for reset data
  const handleResetData = () => {
    setTeachers(INITIAL_TEACHERS);
    setAttendanceRecords(generateInitialAttendance());
    setSettings(INITIAL_SCHOOL_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  // Calculate live count of teachers present today
  const todayStr = getTodayDateString();
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
  const todayPresentCount = todayRecords.filter(
    (r) => r.status === 'hadir' || r.status === 'terlambat'
  ).length;
  const totalActiveTeachers = teachers.filter((t) => t.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col selection:bg-emerald-200">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        todayPresentCount={todayPresentCount}
        totalTeachersCount={totalActiveTeachers}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TodayAttendance
                teachers={teachers}
                attendanceRecords={attendanceRecords}
                onSaveAttendance={handleSaveAttendance}
                onCheckOut={handleCheckOut}
                settings={settings}
                onNavigateToTeachers={() => setActiveTab('teachers')}
              />
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AttendanceReport
                teachers={teachers}
                attendanceRecords={attendanceRecords}
                settings={settings}
              />
            </motion.div>
          )}

          {activeTab === 'teachers' && (
            <motion.div
              key="teachers"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TeacherManagement
                teachers={teachers}
                onAddTeacher={handleAddTeacher}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onResetData={handleResetData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} {settings.schoolName} — Sistem Informasi Kehadiran & Jurnal Guru
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Standar Jam Kerja: {settings.workStartTime} - {settings.workEndTime} WITA</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Status Sistem Aktif (WITA)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
