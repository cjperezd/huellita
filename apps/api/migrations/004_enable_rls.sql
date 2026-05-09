-- La API Fastify usa la service_key, no PostgREST con anon key.
-- Sin políticas, RLS bloquea todo acceso vía anon/authenticated y la
-- service_key sigue funcionando porque hace bypass de RLS.
ALTER TABLE public.reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_subscriptions  ENABLE ROW LEVEL SECURITY;
