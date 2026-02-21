export interface Company {
  id: string;
  slug: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  socialMedia: string;
  logo: string;
  createdAt: string;
  positions: string[];
}

export interface Candidate {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  cvFileName: string;
  cvData: string;
  status: CandidateStatus;
  notes: string;
  appliedAt: string;
}

export type CandidateStatus =
  | 'nuevo'
  | 'revisado'
  | 'contactado'
  | 'rechazado';

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  nuevo: 'Nuevo',
  revisado: 'Revisado',
  contactado: 'Contactado',
  rechazado: 'Rechazado',
};

export const STATUS_COLORS: Record<CandidateStatus, string> = {
  nuevo: 'bg-blue-100 text-blue-800',
  revisado: 'bg-yellow-100 text-yellow-800',
  contactado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
};
