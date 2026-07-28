
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','supervisor','teacher','parent','student');
CREATE TYPE public.student_status AS ENUM ('active','paused','graduated','withdrawn');
CREATE TYPE public.attendance_status AS ENUM ('present','absent','late','excused');
CREATE TYPE public.record_type AS ENUM ('hifz','review','consolidation');
CREATE TYPE public.request_status AS ENUM ('pending','approved','rejected');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  gender text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','supervisor'));
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "profiles readable" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()) OR public.has_role(auth.uid(),'teacher'));
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (id = auth.uid() OR public.is_staff(auth.uid()));

-- auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'parent'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BRANCHES
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches public read" ON public.branches FOR SELECT USING (true);
CREATE POLICY "branches staff write" ON public.branches FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TERMS
CREATE TABLE public.terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.terms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.terms TO authenticated;
GRANT ALL ON public.terms TO service_role;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "terms public read" ON public.terms FOR SELECT USING (true);
CREATE POLICY "terms staff write" ON public.terms FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- CIRCLES
CREATE TABLE public.circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  level text,
  gender text NOT NULL DEFAULT 'male',
  days text[] NOT NULL DEFAULT '{}',
  time_from time,
  time_to time,
  capacity int NOT NULL DEFAULT 20,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.circles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circles TO authenticated;
GRANT ALL ON public.circles TO service_role;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "circles public read" ON public.circles FOR SELECT USING (true);
CREATE POLICY "circles staff write" ON public.circles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_circles_updated BEFORE UPDATE ON public.circles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STUDENTS
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  full_name text NOT NULL,
  birth_date date,
  gender text NOT NULL DEFAULT 'male',
  phone text,
  guardian_name text,
  guardian_phone text,
  parent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  circle_id uuid REFERENCES public.circles(id) ON DELETE SET NULL,
  status public.student_status NOT NULL DEFAULT 'active',
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE SEQUENCE public.student_code_seq START 1;
CREATE OR REPLACE FUNCTION public.assign_student_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := 'FRD-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.student_code_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_students_code BEFORE INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.assign_student_code();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
GRANT USAGE ON SEQUENCE public.student_code_seq TO authenticated, service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.teaches_student(_user_id uuid, _student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.circles c ON c.id = s.circle_id
    WHERE s.id = _student_id AND c.teacher_id = _user_id
  );
$$;

CREATE POLICY "students read" ON public.students FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid())
  OR parent_id = auth.uid()
  OR user_id = auth.uid()
  OR circle_id IN (SELECT id FROM public.circles WHERE teacher_id = auth.uid())
);
CREATE POLICY "students staff write" ON public.students FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ATTENDANCE
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  circle_id uuid REFERENCES public.circles(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes text,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance read" ON public.attendance FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid())
  OR public.teaches_student(auth.uid(), student_id)
  OR student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid() OR user_id = auth.uid())
);
CREATE POLICY "attendance write" ON public.attendance FOR ALL TO authenticated USING (
  public.is_staff(auth.uid()) OR public.teaches_student(auth.uid(), student_id)
) WITH CHECK (
  public.is_staff(auth.uid()) OR public.teaches_student(auth.uid(), student_id)
);

-- PROGRESS RECORDS
CREATE TABLE public.progress_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  circle_id uuid REFERENCES public.circles(id) ON DELETE SET NULL,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type public.record_type NOT NULL DEFAULT 'hifz',
  surah_from text,
  ayah_from int,
  surah_to text,
  ayah_to int,
  pages numeric(5,2) NOT NULL DEFAULT 0,
  grade numeric(5,2),
  notes text,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_records TO authenticated;
GRANT ALL ON public.progress_records TO service_role;
ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress read" ON public.progress_records FOR SELECT TO authenticated USING (
  public.is_staff(auth.uid())
  OR public.teaches_student(auth.uid(), student_id)
  OR student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid() OR user_id = auth.uid())
);
CREATE POLICY "progress write" ON public.progress_records FOR ALL TO authenticated USING (
  public.is_staff(auth.uid()) OR public.teaches_student(auth.uid(), student_id)
) WITH CHECK (
  public.is_staff(auth.uid()) OR public.teaches_student(auth.uid(), student_id)
);

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements public read" ON public.announcements FOR SELECT USING (is_published);
CREATE POLICY "announcements staff write" ON public.announcements FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications own read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "notifications own update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications staff write" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) OR public.has_role(auth.uid(),'teacher'));

-- REGISTRATION REQUESTS
CREATE TABLE public.registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  birth_date date,
  gender text NOT NULL DEFAULT 'male',
  guardian_name text,
  guardian_phone text NOT NULL,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  preferred_time text,
  notes text,
  status public.request_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.registration_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_requests TO authenticated;
GRANT ALL ON public.registration_requests TO service_role;
ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests public insert" ON public.registration_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "requests staff manage" ON public.registration_requests FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- PUBLIC STUDENT LOOKUP BY CODE (limited data)
CREATE OR REPLACE FUNCTION public.get_student_public(_code text)
RETURNS TABLE (
  full_name text,
  code text,
  circle_name text,
  branch_name text,
  total_pages numeric,
  records_count bigint,
  attendance_rate numeric,
  last_record_date date
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.full_name, s.code, c.name, b.name,
    COALESCE((SELECT SUM(pages) FROM public.progress_records p WHERE p.student_id = s.id),0),
    (SELECT COUNT(*) FROM public.progress_records p WHERE p.student_id = s.id),
    COALESCE((SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE a.status IN ('present','late')) / NULLIF(COUNT(*),0), 0)
              FROM public.attendance a WHERE a.student_id = s.id), 0),
    (SELECT MAX(p.date) FROM public.progress_records p WHERE p.student_id = s.id)
  FROM public.students s
  LEFT JOIN public.circles c ON c.id = s.circle_id
  LEFT JOIN public.branches b ON b.id = s.branch_id
  WHERE upper(s.code) = upper(trim(_code))
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_student_public(text) TO anon, authenticated;

-- SEED
INSERT INTO public.branches (name, address, phone, description) VALUES
 ('الفرع الرئيسي', 'حي النور - الشارع العام', '0500000001', 'المقر الرئيسي لمركز الفردوس القرآني'),
 ('فرع البنات', 'حي السلام - بجوار الجامع الكبير', '0500000002', 'حلقات خاصة بالطالبات'),
 ('الفرع الصيفي', 'حي الروضة', '0500000003', 'حلقات مكثفة في الإجازة الصيفية');

INSERT INTO public.terms (name, start_date, end_date, is_active) VALUES
 ('الفصل الدراسي الأول 1447', '2026-08-01', '2026-12-15', true),
 ('الفصل الدراسي الثاني 1447', '2027-01-05', '2027-05-20', false);

INSERT INTO public.circles (branch_id, name, level, gender, days, time_from, time_to, capacity)
SELECT b.id, v.name, v.level, v.gender, v.days::text[], v.tf::time, v.tt::time, v.cap
FROM (VALUES
  ('حلقة الفاتحة','مبتدئ','male','{"الأحد","الثلاثاء","الخميس"}','16:00','17:30',20),
  ('حلقة النور','متوسط','male','{"السبت","الاثنين","الأربعاء"}','17:30','19:00',18),
  ('حلقة الفرقان','متقدم','male','{"الأحد","الثلاثاء","الخميس"}','19:30','21:00',15)
) AS v(name, level, gender, days, tf, tt, cap)
CROSS JOIN LATERAL (SELECT id FROM public.branches WHERE name = 'الفرع الرئيسي' LIMIT 1) b;

INSERT INTO public.announcements (title, body, audience) VALUES
 ('بدء التسجيل للفصل الدراسي الأول', 'يسر مركز الفردوس القرآني إعلان فتح باب التسجيل لجميع الفئات العمرية.', 'all'),
 ('مسابقة الفردوس السنوية للحفظ', 'تنطلق المسابقة السنوية لحفظ القرآن الكريم بجوائز قيمة لأوائل الحفظة.', 'all');
