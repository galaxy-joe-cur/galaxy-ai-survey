create table if not exists survey_responses (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  name text not null,
  department text,
  job_title text,
  contact text,
  payload jsonb not null
);

create index if not exists survey_responses_created_at_idx
  on survey_responses (created_at desc);
