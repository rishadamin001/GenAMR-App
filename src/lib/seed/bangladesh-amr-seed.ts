import type { Division, Hospital, Sample, Store } from "../types";
export const divisions: Division[] = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];
export const hospitals: Hospital[] = [
  ["Asperia Healthcare Limited", "ASP", "Chattogram", 22.36, 91.82],
  ["Dhaka Medical College Hospital ICU", "DMCH", "Dhaka", 23.72, 90.4],
  ["Chittagong Medical College Hospital", "CMCH", "Chattogram", 22.36, 91.83],
  ["icddr,b Sentinel Tertiary ICU", "ICDDRB", "Dhaka", 23.78, 90.4],
  ["Square Hospital ICU", "SQUARE", "Dhaka", 23.75, 90.38],
  [
    "Chevron Clinical Laboratory / Epic Health Care",
    "CHEVRON",
    "Chattogram",
    22.36,
    91.82,
  ],
  ["Rajshahi Medical College ICU", "RMCH", "Rajshahi", 24.37, 88.59],
  ["Sylhet MAG Osmani Medical College ICU", "SOMCH", "Sylhet", 24.9, 91.85],
].map((h, i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  name: String(h[0]),
  code: String(h[1]),
  division: h[2] as Division,
  latitude: Number(h[3]),
  longitude: Number(h[4]),
  tier: "Synthetic partner profile",
  icu_beds: 12 + i * 4,
}));
export const markers = [
  "16S rRNA",
  "blaNDM",
  "blaOXA-48",
  "blaKPC",
  "blaCTX-M",
  "blaSHV",
  "blaTEM",
  "qnrS",
  "qnrB",
  "aac(6′)-Ib-cr",
  "rmtB",
  "armA",
  "aadB",
  "sul1",
  "dfrA",
  "mcr-1",
];
const cases: {
  title: string;
  hospital: number;
  age: number;
  sex: string;
  organism: string;
  specimen: string;
  drug: string;
  targets: Record<string, number>;
  mutations: string[];
  step_down: boolean;
}[] = [
  {
    title: "Fast-track MBL",
    hospital: 1,
    age: 68,
    sex: "M",
    organism: "Klebsiella pneumoniae (ST11)",
    specimen: "endotracheal_aspirate",
    drug: "Meropenem",
    targets: { blaNDM: 19.8, "blaCTX-M": 20.4, rmtB: 22.1 },
    mutations: [],
    step_down: false,
  },
  {
    title: "QRDR triple mutant",
    hospital: 0,
    age: 72,
    sex: "F",
    organism: "Escherichia coli",
    specimen: "blood",
    drug: "Ceftriaxone",
    targets: { "blaCTX-M": 21.2, qnrS: 26.5 },
    mutations: ["S83L", "D87N", "S80I"],
    step_down: true,
  },
  {
    title: "Carbapenem-sparing wild type",
    hospital: 2,
    age: 64,
    sex: "M",
    organism: "Klebsiella pneumoniae",
    specimen: "sputum",
    drug: "Ciprofloxacin",
    targets: { blaSHV: 23, sul1: 24.5 },
    mutations: [],
    step_down: true,
  },
  {
    title: "Dual carbapenemase",
    hospital: 4,
    age: 59,
    sex: "M",
    organism: "Klebsiella pneumoniae (ST15)",
    specimen: "blood",
    drug: "Meropenem",
    targets: { blaNDM: 20.1, "blaOXA-48": 21.9, blaTEM: 22.8 },
    mutations: [],
    step_down: false,
  },
  {
    title: "Acinetobacter ICU",
    hospital: 3,
    age: 51,
    sex: "F",
    organism: "Acinetobacter baumannii",
    specimen: "endotracheal_aspirate",
    drug: "Meropenem",
    targets: { "blaOXA-51-like": 18.9, blaNDM: 20.7, aadB: 23.4 },
    mutations: [],
    step_down: false,
  },
  {
    title: "Colistin resistance alert",
    hospital: 5,
    age: 75,
    sex: "M",
    organism: "Escherichia coli",
    specimen: "urine",
    drug: "Ceftriaxone",
    targets: { "blaCTX-M": 20, "mcr-1": 24.1 },
    mutations: [],
    step_down: false,
  },
];
export function seed(): Store {
  return {
    schema: 1,
    modelVersion: 2,
    weights: { gene: 1, qrdr: 1.8 },
    confirmations: [],
    samples: Array.from({ length: 66 }, (_, i): Sample => {
      const c = cases[i % 6],
        h = hospitals[i < 6 ? c.hospital : i % 8];
      return {
        id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
        sample_code: `GAMR-BD-${String(i + 1).padStart(3, "0")}`,
        hospital_id: h.id,
        division: i < 6 ? h.division : divisions[i % 8],
        patient_alias: `Synthetic ICU ${i + 1}`,
        patient_age: c.age,
        patient_sex: c.sex,
        ward_unit: "ICU",
        ventilated: c.specimen === "endotracheal_aspirate",
        specimen_type: c.specimen,
        empirical_drug: c.drug,
        organism: c.organism,
        title: c.title,
        targets: {
          ...Object.fromEntries(
            markers.map((m) => [m, m === "16S rRNA" ? 18 : 40]),
          ),
          ...c.targets,
        },
        mutations: [...c.mutations],
        step_down: c.step_down,
        internal_control_ct: 25,
        collected_at: "2026-11-04T08:00:00.000Z",
        current_stage: 1,
      };
    }),
  };
}
