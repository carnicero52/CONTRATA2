'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCurrentCompany, 
  logout, 
  getCandidatesByCompany,
  updateCandidateStatus,
  updateCandidateNotes,
  deleteCandidate,
  downloadCSV,
  getCompanyBySlug
} from '@/lib/storage';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';
import type { Candidate, CandidateStatus, Company } from '@/types';
import { 
  LogOut, Users, FileText, Download, Link, Trash2, 
  Eye, X, Check, Search, Filter
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState<CandidateStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const currentCompany = getCurrentCompany();
    if (!currentCompany) {
      router.push('/');
    } else {
      setCompany(currentCompany);
      loadCandidates(currentCompany.id);
    }
  }, [router]);

  const loadCandidates = (companyId: string) => {
    const cands = getCandidatesByCompany(companyId);
    setCandidates(cands);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleStatusChange = (id: string, status: CandidateStatus) => {
    updateCandidateStatus(id, status);
    if (company) loadCandidates(company.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este candidato?')) {
      deleteCandidate(id);
      if (company) loadCandidates(company.id);
    }
  };

  const handleSaveNotes = () => {
    if (selectedCandidate) {
      updateCandidateNotes(selectedCandidate.id, notes);
      if (company) loadCandidates(company.id);
      setSelectedCandidate(null);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/aplicar/${company?.slug}` 
    : '';

  if (!company) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{company.name}</h1>
            <p className="text-sm text-gray-500">Panel de Administración</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-2xl font-bold text-gray-800">{candidates.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{candidates.filter(c => c.status === 'nuevo').length}</p>
            <p className="text-sm text-gray-500">Nuevos</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-2xl font-bold text-green-600">{candidates.filter(c => c.status === 'contactado').length}</p>
            <p className="text-sm text-gray-500">Contactados</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-2xl font-bold text-red-600">{candidates.filter(c => c.status === 'rechazado').length}</p>
            <p className="text-sm text-gray-500">Rechazados</p>
          </div>
        </div>

        {/* Public Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm font-medium text-blue-800 mb-2">📋 Enlace público para candidatos:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar candidato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              <option value="all">Todos</option>
              <option value="nuevo">Nuevos</option>
              <option value="revisado">Revisados</option>
              <option value="contactado">Contactados</option>
              <option value="rechazado">Rechazados</option>
            </select>
            <button
              onClick={() => downloadCSV(company.id, company.name)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Candidates List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredCandidates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay candidatos {filter !== 'all' ? 'con este estado' : ''}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCandidates.map((candidate) => (
                <div key={candidate.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-800">{candidate.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[candidate.status]}`}>
                          {STATUS_LABELS[candidate.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{candidate.email} • {candidate.phone}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Postuló: {new Date(candidate.appliedAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={candidate.status}
                        onChange={(e) => handleStatusChange(candidate.id, e.target.value as CandidateStatus)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { setSelectedCandidate(candidate); setNotes(candidate.notes); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedCandidate.name}</h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedCandidate.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{selectedCandidate.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Puesto</p>
                <p className="font-medium">{selectedCandidate.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CV</p>
                {selectedCandidate.cvData ? (
                  <a
                    href={selectedCandidate.cvData}
                    download={selectedCandidate.cvFileName}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    {selectedCandidate.cvFileName}
                  </a>
                ) : (
                  <p className="text-gray-400">No adjuntado</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Notas</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Agregar notas..."
                />
              </div>
              <button
                onClick={handleSaveNotes}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Guardar Notas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
