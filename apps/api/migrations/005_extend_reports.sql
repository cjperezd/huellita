-- Extiende reports con todos los campos del tipo Report de @huellita/shared.
-- Las columnas se agregan nullable para no romper inserciones parciales o
-- futuras migraciones de datos. La validación de campos requeridos vive
-- en la capa de API (Fastify schemas).
ALTER TABLE reports
  ADD COLUMN pet_id          UUID,
  ADD COLUMN pet_name        TEXT,
  ADD COLUMN pet_breed       TEXT,
  ADD COLUMN pet_color       TEXT,
  ADD COLUMN pet_description TEXT,
  ADD COLUMN pet_photos      TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN pet_microchip   TEXT,
  ADD COLUMN address         TEXT,
  ADD COLUMN neighborhood    TEXT,
  ADD COLUMN city            TEXT,
  ADD COLUMN province        TEXT,
  ADD COLUMN contact_name    TEXT,
  ADD COLUMN contact_phone   TEXT,
  ADD COLUMN user_id         TEXT,
  ADD COLUMN resolved_at     TIMESTAMPTZ;
