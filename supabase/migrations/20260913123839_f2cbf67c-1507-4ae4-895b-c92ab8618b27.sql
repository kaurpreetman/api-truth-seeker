CREATE TABLE public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  listing_id TEXT NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'sale',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id, listing_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_listings TO authenticated;
GRANT ALL ON public.saved_listings TO service_role;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their saved listings" ON public.saved_listings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can save listings" ON public.saved_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their saved listings" ON public.saved_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.update_saved_listings_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_saved_listings_updated_at BEFORE UPDATE ON public.saved_listings FOR EACH ROW EXECUTE FUNCTION public.update_saved_listings_updated_at();