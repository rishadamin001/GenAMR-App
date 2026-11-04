-- GenAMR synthetic research schema. No patient production use is authorized by this migration.
begin;
create table public.hospitals (
 id uuid primary key default gen_random_uuid(), name text not null, code text not null unique,
 division text not null check (division in ('Dhaka','Chattogram','Rajshahi','Khulna','Sylhet','Barishal','Rangpur','Mymensingh')),
 tier text not null, icu_beds integer not null check(icu_beds>=0), latitude numeric check(latitude between -90 and 90), longitude numeric check(longitude between -180 and 180)
);
create table public.amr_knowledge_base (
 id uuid primary key default gen_random_uuid(), marker_name text not null unique,
 marker_type text not null check(marker_type in ('acquired_gene','point_mutation')), ambler_class text check(ambler_class in ('A','B','C','D')),
 aro_accession text, target_species text[] not null default '{}', affected_drugs jsonb not null default '{}', reflex_trigger_rule jsonb not null default '{}', clinical_mechanism_note text not null
);
create table public.samples (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete restrict,
 hospital_id uuid not null references public.hospitals(id) on delete restrict, sample_code text not null, patient_alias text not null,
 patient_age integer not null check(patient_age between 0 and 120), patient_sex text not null check(patient_sex in ('M','F','X')),
 ward_unit text not null, ventilated boolean not null default false,
 specimen_type text not null check(specimen_type in ('blood','endotracheal_aspirate','urine','sputum','wound_swab')),
 empirical_drug text not null, current_stage integer not null default 1 check(current_stage between 1 and 5),
 reflex_triggered boolean not null default false, reflex_reason text, base_fee_bdt integer not null default 1200 check(base_fee_bdt=1200),
 sequencing_fee_bdt integer not null default 0 check(sequencing_fee_bdt in (0,850)), collected_at timestamptz not null default now(), reported_at timestamptz,
 unique(owner_id,sample_code), check((reflex_triggered and sequencing_fee_bdt=850) or (not reflex_triggered and sequencing_fee_bdt=0)), check(reported_at is null or reported_at>=collected_at)
);
create index samples_hospital_idx on public.samples(hospital_id);
create index samples_owner_idx on public.samples(owner_id);
create table public.qpcr_runs (
 id uuid primary key default gen_random_uuid(), sample_id uuid not null references public.samples(id) on delete restrict,
 organism_detected text not null, internal_control_ct numeric not null check(internal_control_ct between 0 and 45),
 run_status text not null check(run_status in ('pass','qc_fail')), targets_json jsonb not null, completed_at timestamptz not null default now()
);
create index qpcr_sample_idx on public.qpcr_runs(sample_id);
create table public.sanger_runs (
 id uuid primary key default gen_random_uuid(), sample_id uuid not null references public.samples(id) on delete restrict,
 target_locus text not null check(target_locus in ('gyrA_QRDR','parC_QRDR','blaSHV_allele','blaTEM_allele')),
 primer_pair text not null, amplicon_bp integer not null check(amplicon_bp>0), ab1_trace_json jsonb not null,
 mutations_detected text[] not null default '{}', completed_at timestamptz not null default now()
);
create index sanger_sample_idx on public.sanger_runs(sample_id);
create table public.ast_predictions (
 id uuid primary key default gen_random_uuid(), sample_id uuid not null references public.samples(id) on delete restrict,
 antibiotic_name text not null, drug_class text not null, predicted_sir text not null check(predicted_sir in ('R','S','I')),
 confidence_score numeric not null check(confidence_score between 0 and 100), rule_source text not null,
 ml_probability_r numeric not null check(ml_probability_r between 0 and 1), genetic_evidence text[] not null default '{}',
 stewardship_recommendation text not null, therapy_tier text not null check(therapy_tier in ('first_line','second_line','salvage_last_resort','contraindicated')),
 unique(sample_id,antibiotic_name)
);
create table public.phenotypic_ast_confirmations (
 id uuid primary key default gen_random_uuid(), sample_id uuid not null references public.samples(id) on delete restrict,
 antibiotic_name text not null, phenotypic_mic numeric not null check(phenotypic_mic>=0), confirmed_sir text not null check(confirmed_sir in ('R','S','I')),
 concordance_type text not null check(concordance_type in ('true_positive','true_negative','major_error_ME','very_major_error_VME','minor_error')),
 logged_by uuid not null default auth.uid() references auth.users(id) on delete restrict, confirmed_at timestamptz not null default now()
);
create index confirmations_sample_idx on public.phenotypic_ast_confirmations(sample_id);
create index confirmations_logger_idx on public.phenotypic_ast_confirmations(logged_by);
create table public.ml_model_versions (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete restrict, version_tag text not null,
 training_samples_count integer not null check(training_samples_count>=0), balanced_accuracy numeric check(balanced_accuracy between 0 and 100),
 me_rate numeric check(me_rate between 0 and 100), vme_rate numeric check(vme_rate between 0 and 100), feature_weights_json jsonb not null,
 deployed_at timestamptz not null default now(), unique(owner_id,version_tag)
);
-- Public reference data is read-only. Private assay rows require a verified user and parent ownership.
alter table public.hospitals enable row level security;
alter table public.amr_knowledge_base enable row level security;
alter table public.samples enable row level security;
alter table public.qpcr_runs enable row level security;
alter table public.sanger_runs enable row level security;
alter table public.ast_predictions enable row level security;
alter table public.phenotypic_ast_confirmations enable row level security;
alter table public.ml_model_versions enable row level security;
revoke all on public.hospitals,public.amr_knowledge_base,public.samples,public.qpcr_runs,public.sanger_runs,public.ast_predictions,public.phenotypic_ast_confirmations,public.ml_model_versions from anon,authenticated;
grant select on public.hospitals,public.amr_knowledge_base to anon,authenticated;
grant select,insert,update on public.samples,public.qpcr_runs,public.sanger_runs,public.ast_predictions,public.phenotypic_ast_confirmations,public.ml_model_versions to authenticated;
create policy reference_hospitals on public.hospitals for select to anon,authenticated using(true);
create policy reference_knowledge on public.amr_knowledge_base for select to anon,authenticated using(true);
create policy own_samples on public.samples for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy own_models on public.ml_model_versions for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy own_qpcr on public.qpcr_runs for all to authenticated using(exists(select 1 from public.samples s where s.id=sample_id and s.owner_id=(select auth.uid()))) with check(exists(select 1 from public.samples s where s.id=sample_id and s.owner_id=(select auth.uid())));
create policy own_sanger on public.sanger_runs for all to authenticated using(exists(select 1 from public.samples s where s.id=sample_id and s.owner_id=(select auth.uid()))) with check(exists(select 1 from public.samples s where s.id=sample_id and s.owner_id=(select auth.uid())));
create policy own_predictions on public.ast_predictions for all to authenticated using(exists(select 1 from public.samples s where s.id=sample_id and s.owner_id=(select auth.uid()))) with check(exists(select 1 from public.samples s where s.id=sample_id and s.owner_id=(select auth.uid())));
create policy own_confirmations on public.phenotypic_ast_confirmations for all to authenticated using(exists(select 1 from public.samples s where s.id=sample_id and s.owner_id=(select auth.uid()))) with check(logged_by=(select auth.uid()) and exists(select 1 from public.samples s where s.id=sample_id and s.owner_id=(select auth.uid())));
insert into public.hospitals(id,name,code,division,tier,icu_beds,latitude,longitude) values
('00000000-0000-4000-8000-000000000001','Asperia Healthcare Limited','ASP','Chattogram','Synthetic partner profile',12,22.36,91.82),
('00000000-0000-4000-8000-000000000002','Dhaka Medical College Hospital ICU','DMCH','Dhaka','Synthetic partner profile',16,23.72,90.4),
('00000000-0000-4000-8000-000000000003','Chittagong Medical College Hospital','CMCH','Chattogram','Synthetic partner profile',20,22.36,91.83),
('00000000-0000-4000-8000-000000000004','icddr,b Sentinel Tertiary ICU','ICDDRB','Dhaka','Synthetic partner profile',24,23.78,90.4),
('00000000-0000-4000-8000-000000000005','Square Hospital ICU','SQUARE','Dhaka','Synthetic partner profile',28,23.75,90.38),
('00000000-0000-4000-8000-000000000006','Chevron Clinical Laboratory / Epic Health Care','CHEVRON','Chattogram','Synthetic partner profile',32,22.36,91.82),
('00000000-0000-4000-8000-000000000007','Rajshahi Medical College ICU','RMCH','Rajshahi','Synthetic partner profile',36,24.37,88.59),
('00000000-0000-4000-8000-000000000008','Sylhet MAG Osmani Medical College ICU','SOMCH','Sylhet','Synthetic partner profile',40,24.9,91.85);
insert into public.amr_knowledge_base(marker_name,marker_type,ambler_class,clinical_mechanism_note) values
('blaNDM','acquired_gene','B','Educational MBL marker; phenotype confirmation required'),
('blaKPC','acquired_gene','A','Educational class A carbapenemase marker'),
('blaOXA-48','acquired_gene','D','Educational class D carbapenemase marker'),
('mcr-1','acquired_gene',null,'Educational polymyxin resistance signal'),
('gyrA S83L + D87N','point_mutation',null,'Educational QRDR combination signal');
commit;
