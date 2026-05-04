export interface Material {
  id: string;
  name: string;
  suggested_dosage: string;
  notes: string;
  created_at: string;
}

export interface SprayLog {
  id: string;
  date: string;
  material_id: string;
  concentration: string;
  comment: string;
  created_at: string;
  material?: Material;
}
