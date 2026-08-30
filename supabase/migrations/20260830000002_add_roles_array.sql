-- Xóa constraint cũ (nếu có)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Đổi tên cột role cũ để backup
ALTER TABLE profiles RENAME COLUMN role TO old_role;

-- Tạo cột roles mới dạng mảng
ALTER TABLE profiles ADD COLUMN roles TEXT[] DEFAULT '{"user"}';

-- Cập nhật dữ liệu từ cột cũ sang cột mới (nếu đang là admin thì gán vào mảng)
UPDATE profiles SET roles = ARRAY['admin', 'user'] WHERE old_role = 'admin';
UPDATE profiles SET roles = ARRAY['user'] WHERE old_role = 'user';

-- (Tùy chọn) Gán đích danh email quanvu2k3@gmail.com làm admin
UPDATE profiles 
SET roles = ARRAY['admin', 'user'] 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'quanvu2k3@gmail.com'
);

-- Bỏ cột cũ sau khi migrate xong
ALTER TABLE profiles DROP COLUMN old_role;

-- Chống lặp sự kiện khi cào (Cùng một link nguồn không thể cào 2 lần)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique_source ON events(source_url) WHERE source_url IS NOT NULL;

-- Chống lặp khi người dùng đăng tay (Cùng tên và cùng ngày bắt đầu thì báo lỗi)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique_title_date ON events(title, start_date);

-- Cấp quyền truy cập cơ bản cho bảng profiles để sửa lỗi permission denied
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
