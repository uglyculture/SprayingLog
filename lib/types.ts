export interface Material {
  id: string;
  name: string;
  suggested_dosage: string;
  default_unit: string;
  notes: string;
  created_at: string;
}

export interface SpraySessionItem {
  id: string;
  session_id: string;
  material_id: string;
  concentration: string;
  unit: string;
  material?: Material;
}

export interface SpraySession {
  id: string;
  date: string;
  comment: string;
  created_at: string;
  items?: SpraySessionItem[];
}
