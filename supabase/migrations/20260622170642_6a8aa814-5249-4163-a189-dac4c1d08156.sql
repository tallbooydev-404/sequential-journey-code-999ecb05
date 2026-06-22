
CREATE POLICY "Deny all to clients" ON public.telegram_pending_registrations
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
