-- Cho phép admin cập nhật bảng events (Duyệt / Từ chối sự kiện)
DROP POLICY IF EXISTS "Admin can update events" ON events;
CREATE POLICY "Admin can update events" ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND 'admin' = ANY(roles)
    )
  );
