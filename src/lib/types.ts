export type SIR = "S" | "I" | "R";
export type Division =
  | "Dhaka"
  | "Chattogram"
  | "Rajshahi"
  | "Khulna"
  | "Sylhet"
  | "Barishal"
  | "Rangpur"
  | "Mymensingh";
export type Hospital = {
  id: string;
  name: string;
  code: string;
  division: Division;
  icu_beds: number;
  latitude: number;
  longitude: number;
  tier: string;
};
export type Sample = {
  id: string;
  sample_code: string;
  hospital_id: string;
  division: Division;
  patient_alias: string;
  patient_age: number;
  patient_sex: string;
  ward_unit: string;
  ventilated: boolean;
  specimen_type: string;
  empirical_drug: string;
  organism: string;
  title: string;
  targets: Record<string, number>;
  mutations: string[];
  step_down: boolean;
  internal_control_ct: number;
  collected_at: string;
  current_stage: number;
};
export type Prediction = {
  antibiotic_name: string;
  drug_class: string;
  predicted_sir: SIR;
  confidence_score: number;
  ml_probability_r: number;
  genetic_evidence: string[];
  rule_source: string;
  stewardship_recommendation: string;
  therapy_tier:
    | "first_line"
    | "second_line"
    | "salvage_last_resort"
    | "contraindicated";
};
export type Confirmation = {
  id: string;
  sample_id: string;
  antibiotic_name: string;
  predicted_sir: SIR;
  confirmed_sir: SIR;
  phenotypic_mic: number;
  confirmed_at: string;
};
export type Store = {
  schema: 1;
  samples: Sample[];
  confirmations: Confirmation[];
  modelVersion: number;
  weights: Record<string, number>;
};
