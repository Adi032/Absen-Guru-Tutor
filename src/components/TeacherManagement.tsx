import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Users,
  Phone,
  Mail,
  BookOpen,
  X,
  Check,
  UserCheck,
  PowerOff,
} from 'lucide-react';
import { Teacher, EmploymentStatus } from '../types';
import { PKBM_SUBJECTS } from './TodayAttendance';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: string) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
}) => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    nip: string;
    name: string;
    gender: 'L' | 'P';
    subject: string;
    employmentStatus: EmploymentStatus;
    phone: string;
    email: string;
    avatar: string;
  }>({
    nip: '',
    name: '',
    gender: 'L',
    subject: '',
    employmentStatus: 'PNS',
    phone: '',
    email: '',
    avatar: '',
  });

  const openAddModal = () => {
    setFormData({
      nip: '',
      name: '',
      gender: 'L',
      subject: '',
      employmentStatus: 'PNS',
      phone: '',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    });
    setEditingTeacher(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nip: teacher.nip,
      name: teacher.name,
      gender: teacher.gender,
      subject: teacher.subject,
      employmentStatus: teacher.employmentStatus,
      phone: teacher.phone,
      email: teacher.email || '',
      avatar: teacher.avatar,
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nip.trim() || !formData.subject.trim()) {
      alert('Mohon lengkapi NIP, Nama, dan Mata Pelajaran.');
      return;
    }

    if (editingTeacher) {
      const updated: Teacher = {
        ...editingTeacher,
        ...formData,
      };
      onUpdateTeacher(updated);
    } else {
      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        ...formData,
        isActive: true,
      };
      onAddTeacher(newTeacher);
    }

    setIsAddModalOpen(false);
  };

  const toggleTeacherStatus = (teacher: Teacher) => {
    onUpdateTeacher({
      ...teacher,
      isActive: !teacher.isActive,
    });
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.nip.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter !== 'all' && t.employmentStatus !== statusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Daftar Tenaga Pendidik & Guru ({teachers.length})
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data profil, NIP/NUPTK, status kepegawaian, dan mata pelajaran
          </p>
        </div>

        <button
          id="add-teacher-btn"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
        >
          <UserPlus className="h-4 w-4" />
          Tambah Guru Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama guru, NIP, mapel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {['all', 'PNS', 'PPPK', 'GTT/Honorer'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'Semua Status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className={`rounded-2xl border bg-white p-4.5 shadow-2xs transition hover:shadow-md flex flex-col justify-between ${
              teacher.isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start gap-3.5">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        teacher.employmentStatus === 'PNS'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : teacher.employmentStatus === 'PPPK'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {teacher.employmentStatus}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
                        title="Edit Data Guru"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {onDeleteTeacher && (
                        <button
                          onClick={() => setDeletingTeacher(teacher)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                          title="Hapus Guru"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug truncate">
                    {teacher.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{teacher.nip}</p>
                </div>
              </div>

              <div className="mt-3.5 space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-medium">{teacher.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{teacher.phone}</span>
                </div>
                {teacher.email && (
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span
                className={`text-[11px] font-medium flex items-center gap-1.5 ${
                  teacher.isActive ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    teacher.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                {teacher.isActive ? 'Status Aktif Mengajar' : 'Non-Aktif / Pensiun'}
              </span>

              <button
                type="button"
                onClick={() => toggleTeacherStatus(teacher)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                  teacher.isActive
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {teacher.isActive ? 'Non-aktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredTeachers.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 sm:p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {teachers.length === 0
                ? 'Belum Ada Data Guru / Tutor PKBM Menara'
                : 'Tidak Ada Guru yang Sesuai'}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {teachers.length === 0
                ? 'Data guru sebelumnya telah berhasil dibersihkan. Silakan tambahkan data tenaga pendidik atau tutor baru untuk mulai mencatat presensi harian PKBM Menara.'
                : 'Coba ubah kata kunci pencarian atau filter status kepegawaian.'}
            </p>
            {teachers.length === 0 ? (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <UserPlus className="h-4 w-4" />
                Tambah Guru / Tutor Baru
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 underline"
              >
                Reset Filter Pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 text-rose-600 mx-auto mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 text-center">Hapus Data Guru?</h4>
            <p className="text-xs text-slate-500 text-center mt-1.5">
              Apakah Anda yakin ingin menghapus data guru <strong className="text-slate-800">{deletingTeacher.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingTeacher(null)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteTeacher && deletingTeacher) {
                    onDeleteTeacher(deletingTeacher.id);
                  }
                  setDeletingTeacher(null);
                }}
                className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                {editingTeacher ? 'Ubah Data Guru' : 'Tambah Guru Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  NIP / NUPTK <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 19850412 201001 1 008"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Lengkap beserta Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dra. Sri Wahyuni, M.Pd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentStatus: e.target.value as EmploymentStatus,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTT/Honorer">GTT / Guru Honorer</option>
                    <option value="Guru Tetap">Guru Tetap Yayasan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Mata Pelajaran yang Diampu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  list="teacher-subject-list"
                  required
                  placeholder="Contoh: Pemberdayaan / Sosiologi / Sejarah / Matematika"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                />
                <datalist id="teacher-subject-list">
                  {PKBM_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>

                {/* Quick Subject Suggestions */}
                <div className="mt-1.5">
                  <p className="text-[10px] text-slate-400 mb-1">Pilihan cepat mata pelajaran:</p>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                    {PKBM_SUBJECTS.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setFormData({ ...formData, subject: sub })}
                        className={`px-2 py-0.5 text-[10px] rounded-md transition ${
                          formData.subject === sub
                            ? 'bg-emerald-600 text-white font-medium'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. WhatsApp/HP</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Sekolah</label>
                  <input
                    type="email"
                    placeholder="nama@sekolah.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">URL Foto Profil / Avatar</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                >
                  <Check className="h-4 w-4" />
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
