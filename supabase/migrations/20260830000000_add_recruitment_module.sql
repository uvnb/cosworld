-- 1. BẢNG BÀI ĐĂNG TUYỂN DỤNG (recruitments)
CREATE TABLE recruitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  roles TEXT[] NOT NULL,
  location TEXT NOT NULL,
  budget TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'FULL')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recruitments ENABLE ROW LEVEL SECURITY;

-- Policies for recruitments
CREATE POLICY "Public read access for recruitments" ON recruitments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own recruitments" ON recruitments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own recruitments" ON recruitments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own recruitments" ON recruitments
  FOR DELETE USING (auth.uid() = author_id);


-- 2. BẢNG ỨNG TUYỂN (recruitment_applications)
CREATE TABLE recruitment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id UUID REFERENCES recruitments(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  applied_role TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recruitment_id, applicant_id)
);

-- Enable RLS
ALTER TABLE recruitment_applications ENABLE ROW LEVEL SECURITY;

-- Policies for applications
-- Only the applicant or the author of the recruitment can see the application
CREATE POLICY "Read access for applicants and recruitment authors" ON recruitment_applications
  FOR SELECT USING (
    auth.uid() = applicant_id OR 
    auth.uid() IN (SELECT author_id FROM recruitments WHERE id = recruitment_applications.recruitment_id)
  );

CREATE POLICY "Applicants can insert applications" ON recruitment_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Only author of the recruitment can update the application status
CREATE POLICY "Recruitment authors can update application status" ON recruitment_applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT author_id FROM recruitments WHERE id = recruitment_applications.recruitment_id)
  );

CREATE POLICY "Applicants can delete their own applications" ON recruitment_applications
  FOR DELETE USING (auth.uid() = applicant_id);


-- 3. BẢNG THÀNH VIÊN TEAM SAU KHI DUYỆT (team_members)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id UUID REFERENCES recruitments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recruitment_id, user_id)
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team members
-- Team members are public for now, or visible to team only? Let's make it public.
CREATE POLICY "Public read access for team_members" ON team_members
  FOR SELECT USING (true);

-- Only recruitment authors can insert team members
CREATE POLICY "Recruitment authors can insert team members" ON team_members
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT author_id FROM recruitments WHERE id = team_members.recruitment_id)
  );

CREATE POLICY "Recruitment authors can delete team members" ON team_members
  FOR DELETE USING (
    auth.uid() IN (SELECT author_id FROM recruitments WHERE id = team_members.recruitment_id)
  );
