import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Users, ClipboardCheck, FileSpreadsheet, Settings } from 'lucide-react';
import { SchoolSettings } from '../types';
import { PkbmLogo } from './PkbmLogo';
import { getWitaLiveClock } from '../utils/attendanceUtils';

interface HeaderProps {
  activeTab: 'today' | 'report' | 'teachers' | 'settings';
  setActiveTab: (tab: 'today' | 'report' | 'teachers' | 'settings') => void;
  settings: SchoolSettings;
  todayPresentCount: number;
  totalTeachersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  todayPresentCount,
  totalTeachersCount,
}) => {
  const [clockData, setClockData] = useState(() => getWitaLiveClock());

  useEffect(() => {
    const timer = setInterval(() => {
      setClockData(getWitaLiveClock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* School Brand */}
          <div className="flex items-center gap-3.5">
            <PkbmLogo size={46} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  {settings.schoolName}
                </h1>
                <span className="hidden sm:inline-flex rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                  NPSN {settings.schoolNPSN}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                Sistem Presensi Digital Guru & Jurnal Mengajar
              </p>
            </div>
          </div>

          {/* Clock & Info Widget (WITA) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {clockData.fullDateString}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 font-mono">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                <span>
                  {clockData.hours}:{clockData.minutes}:{clockData.seconds} WITA
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-900">
                Hadir: <strong>{todayPresentCount}</strong>/{totalTeachersCount} Guru
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-100 pt-1 pb-1.5 overflow-x-auto no-scrollbar">
          <button
            id="tab-today-btn"
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'today'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Presensi Hari Ini</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'today'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {todayPresentCount}
            </span>
          </button>

          <button
            id="tab-report-btn"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'report'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Rekap & Laporan</span>
          </button>

          <button
            id="tab-teachers-btn"
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'teachers'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Data Guru ({totalTeachersCount})</span>
          </button>

          <button
            id="tab-settings-btn"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Pengaturan Sekolah</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
