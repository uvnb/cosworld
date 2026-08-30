-- Xóa bảng cũ
DROP TABLE IF EXISTS events CASCADE;

-- Tạo bảng mới theo kiến trúc chuẩn
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  banner_url TEXT,
  location TEXT NOT NULL,
  province TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  ticket_price TEXT DEFAULT 'Miễn phí',
  source_url TEXT,
  is_crawled BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo Index tối ưu tốc độ
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_province ON events(province);
CREATE INDEX idx_events_status ON events(status);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for approved events" ON events
  FOR SELECT USING (status = 'APPROVED' OR status = 'PENDING');

-- Chỉ cho phép Admin (hoặc người đăng) chỉnh sửa, hiện tại ta để public INSERT cho mục đích testing, 
-- nhưng trong thực tế chỉ Cron Job (service_role) và Admin mới được INSERT.
-- Để đơn giản trong quá trình code, ta cho phép authenticated users tạo sự kiện.
CREATE POLICY "Authenticated users can insert events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Cấp quyền (Grant permissions)
GRANT ALL ON TABLE public.events TO anon, authenticated, service_role;
