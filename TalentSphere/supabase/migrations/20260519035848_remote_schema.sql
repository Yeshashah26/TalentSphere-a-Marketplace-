drop extension if exists "pg_net";

create type "public"."application_status_enum" as enum ('applied', 'screening', 'interview', 'offer', 'rejected', 'hired');

create type "public"."availability_enum" as enum ('immediate', '2_weeks', '1_month', '2_months', '3_months_plus');

create type "public"."company_size_enum" as enum ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+');

create type "public"."employment_type_enum" as enum ('full_time', 'part_time', 'contract', 'freelance', 'internship');

create type "public"."job_status_enum" as enum ('open', 'closed');

create type "public"."saved_item_type_enum" as enum ('candidate', 'job');

create type "public"."subscription_plan_enum" as enum ('free', 'pro');

create type "public"."visibility_enum" as enum ('public', 'companies_only', 'private');

create type "public"."work_mode_enum" as enum ('remote', 'hybrid', 'onsite');


  create table "public"."admin" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "userid" uuid not null,
    "admin_id" text not null,
    "email_id" text not null,
    "password" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."admin" enable row level security;


  create table "public"."candidate_profile" (
    "candidate_id" uuid not null default gen_random_uuid(),
    "userid" uuid,
    "candidate_name" character varying,
    "candidate_linkedin" character varying,
    "candidate_phone" character varying,
    "candidate_portfolio_link" character varying,
    "candidate_job_title" character varying,
    "candidate_years_of_experience" integer,
    "candidate_skills" text,
    "candidate_photo" character varying,
    "candidate_resume_url" character varying,
    "candidate_educational_degree" character varying,
    "graduation_year" integer,
    "open_to_work" boolean,
    "external_platform_name" character varying,
    "data_source" character varying,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "candidate_resume" text,
    "resume_score" integer
      );


alter table "public"."candidate_profile" enable row level security;


  create table "public"."company_profile" (
    "company_id" uuid not null default gen_random_uuid(),
    "userid" uuid,
    "company_name" character varying,
    "linkedin_profile_name" character varying,
    "linkedin_profile_url" character varying,
    "linkedin_logo_url" character varying,
    "company_website" character varying,
    "hq_country" character varying,
    "year_founded" integer,
    "company_type" character varying,
    "linkedin_industries" character varying,
    "recent_job_openings_title" character varying,
    "recent_job_openings" character varying,
    "all_office_addresses" text,
    "subscription_plan" character varying,
    "external_platform_name" character varying,
    "data_source" character varying,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now()
      );


alter table "public"."company_profile" enable row level security;


  create table "public"."job_application" (
    "job_id" uuid not null default gen_random_uuid(),
    "userid" uuid not null,
    "candidate_id" uuid not null,
    "job_status" character varying
      );


alter table "public"."job_application" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "userid" uuid not null,
    "candidate_id" uuid,
    "company_id" uuid,
    "content" text,
    "conversation_id" uuid,
    "created_at" timestamp without time zone default now()
      );


alter table "public"."messages" enable row level security;


  create table "public"."saved_candidate" (
    "id" uuid not null default gen_random_uuid(),
    "userid" uuid not null,
    "candidate_id" uuid,
    "Company_ID" uuid
      );


alter table "public"."saved_candidate" enable row level security;


  create table "public"."saved_company" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "userid" uuid not null,
    "company_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."saved_company" enable row level security;


  create table "public"."users" (
    "userid" uuid not null default gen_random_uuid(),
    "role" character varying,
    "email_id" character varying not null,
    "password" character varying not null,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now()
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX admin_admin_id_key ON public.admin USING btree (admin_id);

CREATE UNIQUE INDEX admin_email_id_key ON public.admin USING btree (email_id);

CREATE UNIQUE INDEX admin_pkey ON public.admin USING btree (id);

CREATE UNIQUE INDEX candidate_profile_pkey ON public.candidate_profile USING btree (candidate_id);

CREATE UNIQUE INDEX company_profile_pkey ON public.company_profile USING btree (company_id);

CREATE UNIQUE INDEX job_application_pkey ON public.job_application USING btree (job_id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX saved_candidate_pkey ON public.saved_candidate USING btree (id);

CREATE UNIQUE INDEX saved_company_pkey ON public.saved_company USING btree (id);

CREATE UNIQUE INDEX saved_company_userid_company_id_uniq ON public.saved_company USING btree (userid, company_id);

CREATE UNIQUE INDEX users_email_id_key ON public.users USING btree (email_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (userid);

alter table "public"."admin" add constraint "admin_pkey" PRIMARY KEY using index "admin_pkey";

alter table "public"."candidate_profile" add constraint "candidate_profile_pkey" PRIMARY KEY using index "candidate_profile_pkey";

alter table "public"."company_profile" add constraint "company_profile_pkey" PRIMARY KEY using index "company_profile_pkey";

alter table "public"."job_application" add constraint "job_application_pkey" PRIMARY KEY using index "job_application_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."saved_candidate" add constraint "saved_candidate_pkey" PRIMARY KEY using index "saved_candidate_pkey";

alter table "public"."saved_company" add constraint "saved_company_pkey" PRIMARY KEY using index "saved_company_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."admin" add constraint "admin_admin_id_key" UNIQUE using index "admin_admin_id_key";

alter table "public"."admin" add constraint "admin_email_id_key" UNIQUE using index "admin_email_id_key";

alter table "public"."admin" add constraint "admin_userid_fkey" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE not valid;

alter table "public"."admin" validate constraint "admin_userid_fkey";

alter table "public"."candidate_profile" add constraint "fk_candidate_user" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE SET NULL not valid;

alter table "public"."candidate_profile" validate constraint "fk_candidate_user";

alter table "public"."company_profile" add constraint "fk_company_user" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE SET NULL not valid;

alter table "public"."company_profile" validate constraint "fk_company_user";

alter table "public"."job_application" add constraint "fk_job_candidate" FOREIGN KEY (candidate_id) REFERENCES public.candidate_profile(candidate_id) ON DELETE CASCADE not valid;

alter table "public"."job_application" validate constraint "fk_job_candidate";

alter table "public"."job_application" add constraint "fk_job_user" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE not valid;

alter table "public"."job_application" validate constraint "fk_job_user";

alter table "public"."messages" add constraint "fk_message_candidate" FOREIGN KEY (candidate_id) REFERENCES public.candidate_profile(candidate_id) ON DELETE SET NULL not valid;

alter table "public"."messages" validate constraint "fk_message_candidate";

alter table "public"."messages" add constraint "fk_message_company" FOREIGN KEY (company_id) REFERENCES public.company_profile(company_id) ON DELETE SET NULL not valid;

alter table "public"."messages" validate constraint "fk_message_company";

alter table "public"."messages" add constraint "fk_message_user" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "fk_message_user";

alter table "public"."saved_candidate" add constraint "fk_saved_candidate" FOREIGN KEY (candidate_id) REFERENCES public.candidate_profile(candidate_id) ON DELETE CASCADE not valid;

alter table "public"."saved_candidate" validate constraint "fk_saved_candidate";

alter table "public"."saved_candidate" add constraint "fk_saved_user" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE not valid;

alter table "public"."saved_candidate" validate constraint "fk_saved_user";

alter table "public"."saved_candidate" add constraint "saved_candidate_Company_ID_fkey" FOREIGN KEY ("Company_ID") REFERENCES public.company_profile(company_id) not valid;

alter table "public"."saved_candidate" validate constraint "saved_candidate_Company_ID_fkey";

alter table "public"."saved_company" add constraint "saved_company_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.company_profile(company_id) ON DELETE CASCADE not valid;

alter table "public"."saved_company" validate constraint "saved_company_company_id_fkey";

alter table "public"."saved_company" add constraint "saved_company_userid_company_id_uniq" UNIQUE using index "saved_company_userid_company_id_uniq";

alter table "public"."saved_company" add constraint "saved_company_userid_fkey" FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE not valid;

alter table "public"."saved_company" validate constraint "saved_company_userid_fkey";

alter table "public"."users" add constraint "users_email_id_key" UNIQUE using index "users_email_id_key";

grant delete on table "public"."admin" to "anon";

grant insert on table "public"."admin" to "anon";

grant references on table "public"."admin" to "anon";

grant select on table "public"."admin" to "anon";

grant trigger on table "public"."admin" to "anon";

grant truncate on table "public"."admin" to "anon";

grant update on table "public"."admin" to "anon";

grant delete on table "public"."admin" to "authenticated";

grant insert on table "public"."admin" to "authenticated";

grant references on table "public"."admin" to "authenticated";

grant select on table "public"."admin" to "authenticated";

grant trigger on table "public"."admin" to "authenticated";

grant truncate on table "public"."admin" to "authenticated";

grant update on table "public"."admin" to "authenticated";

grant delete on table "public"."admin" to "service_role";

grant insert on table "public"."admin" to "service_role";

grant references on table "public"."admin" to "service_role";

grant select on table "public"."admin" to "service_role";

grant trigger on table "public"."admin" to "service_role";

grant truncate on table "public"."admin" to "service_role";

grant update on table "public"."admin" to "service_role";

grant delete on table "public"."candidate_profile" to "anon";

grant insert on table "public"."candidate_profile" to "anon";

grant references on table "public"."candidate_profile" to "anon";

grant select on table "public"."candidate_profile" to "anon";

grant trigger on table "public"."candidate_profile" to "anon";

grant truncate on table "public"."candidate_profile" to "anon";

grant update on table "public"."candidate_profile" to "anon";

grant delete on table "public"."candidate_profile" to "authenticated";

grant insert on table "public"."candidate_profile" to "authenticated";

grant references on table "public"."candidate_profile" to "authenticated";

grant select on table "public"."candidate_profile" to "authenticated";

grant trigger on table "public"."candidate_profile" to "authenticated";

grant truncate on table "public"."candidate_profile" to "authenticated";

grant update on table "public"."candidate_profile" to "authenticated";

grant delete on table "public"."candidate_profile" to "service_role";

grant insert on table "public"."candidate_profile" to "service_role";

grant references on table "public"."candidate_profile" to "service_role";

grant select on table "public"."candidate_profile" to "service_role";

grant trigger on table "public"."candidate_profile" to "service_role";

grant truncate on table "public"."candidate_profile" to "service_role";

grant update on table "public"."candidate_profile" to "service_role";

grant delete on table "public"."company_profile" to "anon";

grant insert on table "public"."company_profile" to "anon";

grant references on table "public"."company_profile" to "anon";

grant select on table "public"."company_profile" to "anon";

grant trigger on table "public"."company_profile" to "anon";

grant truncate on table "public"."company_profile" to "anon";

grant update on table "public"."company_profile" to "anon";

grant delete on table "public"."company_profile" to "authenticated";

grant insert on table "public"."company_profile" to "authenticated";

grant references on table "public"."company_profile" to "authenticated";

grant select on table "public"."company_profile" to "authenticated";

grant trigger on table "public"."company_profile" to "authenticated";

grant truncate on table "public"."company_profile" to "authenticated";

grant update on table "public"."company_profile" to "authenticated";

grant delete on table "public"."company_profile" to "service_role";

grant insert on table "public"."company_profile" to "service_role";

grant references on table "public"."company_profile" to "service_role";

grant select on table "public"."company_profile" to "service_role";

grant trigger on table "public"."company_profile" to "service_role";

grant truncate on table "public"."company_profile" to "service_role";

grant update on table "public"."company_profile" to "service_role";

grant delete on table "public"."job_application" to "anon";

grant insert on table "public"."job_application" to "anon";

grant references on table "public"."job_application" to "anon";

grant select on table "public"."job_application" to "anon";

grant trigger on table "public"."job_application" to "anon";

grant truncate on table "public"."job_application" to "anon";

grant update on table "public"."job_application" to "anon";

grant delete on table "public"."job_application" to "authenticated";

grant insert on table "public"."job_application" to "authenticated";

grant references on table "public"."job_application" to "authenticated";

grant select on table "public"."job_application" to "authenticated";

grant trigger on table "public"."job_application" to "authenticated";

grant truncate on table "public"."job_application" to "authenticated";

grant update on table "public"."job_application" to "authenticated";

grant delete on table "public"."job_application" to "service_role";

grant insert on table "public"."job_application" to "service_role";

grant references on table "public"."job_application" to "service_role";

grant select on table "public"."job_application" to "service_role";

grant trigger on table "public"."job_application" to "service_role";

grant truncate on table "public"."job_application" to "service_role";

grant update on table "public"."job_application" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."saved_candidate" to "anon";

grant insert on table "public"."saved_candidate" to "anon";

grant references on table "public"."saved_candidate" to "anon";

grant select on table "public"."saved_candidate" to "anon";

grant trigger on table "public"."saved_candidate" to "anon";

grant truncate on table "public"."saved_candidate" to "anon";

grant update on table "public"."saved_candidate" to "anon";

grant delete on table "public"."saved_candidate" to "authenticated";

grant insert on table "public"."saved_candidate" to "authenticated";

grant references on table "public"."saved_candidate" to "authenticated";

grant select on table "public"."saved_candidate" to "authenticated";

grant trigger on table "public"."saved_candidate" to "authenticated";

grant truncate on table "public"."saved_candidate" to "authenticated";

grant update on table "public"."saved_candidate" to "authenticated";

grant delete on table "public"."saved_candidate" to "service_role";

grant insert on table "public"."saved_candidate" to "service_role";

grant references on table "public"."saved_candidate" to "service_role";

grant select on table "public"."saved_candidate" to "service_role";

grant trigger on table "public"."saved_candidate" to "service_role";

grant truncate on table "public"."saved_candidate" to "service_role";

grant update on table "public"."saved_candidate" to "service_role";

grant delete on table "public"."saved_company" to "anon";

grant insert on table "public"."saved_company" to "anon";

grant references on table "public"."saved_company" to "anon";

grant select on table "public"."saved_company" to "anon";

grant trigger on table "public"."saved_company" to "anon";

grant truncate on table "public"."saved_company" to "anon";

grant update on table "public"."saved_company" to "anon";

grant delete on table "public"."saved_company" to "authenticated";

grant insert on table "public"."saved_company" to "authenticated";

grant references on table "public"."saved_company" to "authenticated";

grant select on table "public"."saved_company" to "authenticated";

grant trigger on table "public"."saved_company" to "authenticated";

grant truncate on table "public"."saved_company" to "authenticated";

grant update on table "public"."saved_company" to "authenticated";

grant delete on table "public"."saved_company" to "service_role";

grant insert on table "public"."saved_company" to "service_role";

grant references on table "public"."saved_company" to "service_role";

grant select on table "public"."saved_company" to "service_role";

grant trigger on table "public"."saved_company" to "service_role";

grant truncate on table "public"."saved_company" to "service_role";

grant update on table "public"."saved_company" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "candidate_profile: delete own (candidates)"
  on "public"."candidate_profile"
  as permissive
  for delete
  to authenticated
using (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = candidate_profile.userid) AND ((u.role)::text = 'candidate'::text))))));



  create policy "candidate_profile: insert own (candidates)"
  on "public"."candidate_profile"
  as permissive
  for insert
  to authenticated
with check (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = candidate_profile.userid) AND ((u.role)::text = 'candidate'::text))))));



  create policy "candidate_profile: select own (candidates)"
  on "public"."candidate_profile"
  as permissive
  for select
  to authenticated
using (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = candidate_profile.userid) AND ((u.role)::text = 'candidate'::text))))));



  create policy "candidate_profile: update own (candidates)"
  on "public"."candidate_profile"
  as permissive
  for update
  to authenticated
using (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = candidate_profile.userid) AND ((u.role)::text = 'candidate'::text))))))
with check (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = candidate_profile.userid) AND ((u.role)::text = 'candidate'::text))))));



  create policy "company_profile: delete own (companies)"
  on "public"."company_profile"
  as permissive
  for delete
  to authenticated
using (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = company_profile.userid) AND ((u.role)::text = 'company'::text))))));



  create policy "company_profile: insert own (companies)"
  on "public"."company_profile"
  as permissive
  for insert
  to authenticated
with check (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = company_profile.userid) AND ((u.role)::text = 'company'::text))))));



  create policy "company_profile: select own (companies)"
  on "public"."company_profile"
  as permissive
  for select
  to authenticated
using (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = company_profile.userid) AND ((u.role)::text = 'company'::text))))));



  create policy "company_profile: update own (companies)"
  on "public"."company_profile"
  as permissive
  for update
  to authenticated
using (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = company_profile.userid) AND ((u.role)::text = 'company'::text))))))
with check (((userid = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.userid = company_profile.userid) AND ((u.role)::text = 'company'::text))))));



  create policy "Enable insert access for all users"
  on "public"."users"
  as permissive
  for insert
  to authenticated
with check ((userid = auth.uid()));



  create policy "users: delete own"
  on "public"."users"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid));



  create policy "users: select own"
  on "public"."users"
  as permissive
  for select
  to authenticated
using ((userid = auth.uid()));



  create policy "users: update own"
  on "public"."users"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = userid))
with check (((userid = auth.uid()) AND ((role)::text = (( SELECT u.role
   FROM public.users u
  WHERE (u.userid = auth.uid())))::text)));



  create policy "Allow authenticated uploads to candidate_resume"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'candidate_resume'::text));



  create policy "candidate_resume: delete objects"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'candidate_resume'::text));



  create policy "candidate_resume: select objects"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'candidate_resume'::text));



  create policy "candidate_resume: update objects"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'candidate_resume'::text))
with check ((bucket_id = 'candidate_resume'::text));



