-- Thêm cột submitted_by để lưu trữ thông tin người tạo sự kiện
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);

-- Cập nhật RLS để user có thể xem và xóa sự kiện của chính mình
CREATE POLICY "Users can manage their own events" ON events
  FOR ALL USING (auth.uid() = submitted_by);
