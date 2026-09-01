CREATE OR REPLACE FUNCTION public.force_delete_user(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_error_text TEXT;
  v_error_detail TEXT;
  v_error_hint TEXT;
BEGIN
  -- We try to delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
  RETURN '{"success": true}'::jsonb;
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS 
    v_error_text = MESSAGE_TEXT,
    v_error_detail = PG_EXCEPTION_DETAIL,
    v_error_hint = PG_EXCEPTION_HINT;
  
  RETURN jsonb_build_object(
    'success', false,
    'error', v_error_text,
    'detail', v_error_detail,
    'hint', v_error_hint
  );
END;
$$;
