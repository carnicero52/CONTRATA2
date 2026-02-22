import type { Company, Candidate, CandidateStatus } from '../types';

const COMPANIES_KEY = 'cf_companies';
const CANDIDATES_KEY = 'cf_candidates';
const AUTH_KEY = 'cf_auth';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ─── Companies ───────────────────────────────────────────────

export function getCompanies(): Company[] {
  const data = localStorage.getItem(COMPANIES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCompanies(companies: Company[]) {
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
}

export function registerCompany(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  socialMedia: string;
}): { success: boolean; message: string } {
  const companies = getCompanies();

  if (companies.find((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, message: 'Este correo ya está registrado.' };
  }

  let slug = slugify(data.name);

  if (companies.find((c) => c.slug === slug)) {
    slug = slug + '-' + generateId().slice(0, 4);
  }

  const company: Company = {
    id: generateId(),
    slug,
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    address: data.address,
    socialMedia: data.socialMedia,
    logo: '',
    createdAt: new Date().toISOString(),
    positions: ['General'],
  };

  companies.push(company);
  saveCompanies(companies);

  return {
    success: true,
    message: '¡Cuenta creada exitosamente! Ahora inicia sesión.',
  };
}

export function getCompanyBySlug(slug: string): Company | undefined {
  return getCompanies().find((c) => c.slug === slug);
}

export function getCompanyById(id: string): Company | undefined {
  return getCompanies().find((c) => c.id === id);
}

export function updateCompany(id: string, data: Partial<Company>) {
  const companies = getCompanies();
  const index = companies.findIndex((c) => c.id === id);

  if (index !== -1) {
    companies[index] = { ...companies[index], ...data };
    saveCompanies(companies);
  }
}

// ─── Auth ────────────────────────────────────────────────────

export function login(email: string, password: string): Company | null {
  const companies = getCompanies();

  const company = companies.find(
    (c) =>
      c.email.toLowerCase() === email.toLowerCase() &&
      c.password === password
  );

  if (company) {
    localStorage.setItem(AUTH_KEY, company.id);
    return company;
  }

  return null;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentCompany(): Company | null {
  const id = localStorage.getItem(AUTH_KEY);
  if (!id) return null;

  const company = getCompanyById(id);
  return company || null;
}

// ─── Candidates ──────────────────────────────────────────────

export function getCandidates(): Candidate[] {
  const data = localStorage.getItem(CANDIDATES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCandidates(candidates: Candidate[]) {
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
}

export function addCandidate(data: {
  companyId: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  cvFileName: string;
  cvData: string;
}): Candidate {
  const candidates = getCandidates();

  const candidate: Candidate = {
    id: generateId(),
    companyId: data.companyId,
    name: data.name,
    phone: data.phone,
    email: data.email,
    position: data.position,
    cvFileName: data.cvFileName,
    cvData: data.cvData,
    status: 'nuevo',
    notes: '',
    appliedAt: new Date().toISOString(),
  };

  candidates.push(candidate);
  saveCandidates(candidates);

  return candidate;
}

export function getCandidatesByCompany(companyId: string): Candidate[] {
  return getCandidates()
    .filter((c) => c.companyId === companyId)
    .sort(
      (a, b) =>
        new Date(b.appliedAt).getTime() -
        new Date(a.appliedAt).getTime()
    );
}

export function updateCandidateStatus(
  id: string,
  status: CandidateStatus
) {
  const candidates = getCandidates();
  const index = candidates.findIndex((c) => c.id === id);

  if (index !== -1) {
    candidates[index] = { ...candidates[index], status };
    saveCandidates(candidates);
  }
}

export function updateCandidateNotes(id: string, notes: string) {
  const candidates = getCandidates();
  const index = candidates.findIndex((c) => c.id === id);

  if (index !== -1) {
    candidates[index] = { ...candidates[index], notes };
    saveCandidates(candidates);
  }
}

export function deleteCandidate(id: string) {
  const candidates = getCandidates().filter((c) => c.id !== id);
  saveCandidates(candidates);
}

export function exportCandidatesToCSV(companyId: string): string {
  const candidates = getCandidatesByCompany(companyId);

  const headers = [
    'Nombre',
    'Teléfono',
    'Email',
    'Puesto',
    'Estado',
    'Fecha de Postulación',
  ];

  const rows = candidates.map((c) => [
    c.name,
    c.phone,
    c.email,
    c.position,
    c.status.charAt(0).toUpperCase() + c.status.slice(1),
    new Date(c.appliedAt).toLocaleDateString('es-MX'),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
}

export function downloadCSV(companyId: string, companyName: string) {
  const csv = exportCandidatesToCSV(companyId);

  const blob = new Blob(['\ufeff' + csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `candidatos-${slugify(companyName)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
