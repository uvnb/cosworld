-- 1. Cấp quyền truy cập cơ bản cho bảng profiles để Server Actions có thể đọc được role admin
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;

-- 2. Chống lặp sự kiện khi cào (Cùng một link nguồn không thể cào 2 lần)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique_source ON events(source_url) WHERE source_url IS NOT NULL;

-- 3. Chống lặp khi người dùng đăng tay (Cùng tên và cùng ngày bắt đầu thì báo lỗi)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique_title_date ON events(title, start_date);

-- 4. Đảm bảo quanvu2k3@gmail.com chắc chắn có quyền admin (chạy lại đề phòng lỗi)
UPDATE public.profiles 
SET roles = ARRAY['admin', 'user'] 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'quanvu2k3@gmail.com'
);
