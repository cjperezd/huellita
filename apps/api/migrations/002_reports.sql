CREATE TYPE report_type   AS ENUM ('lost', 'found', 'sighting');
CREATE TYPE report_status AS ENUM ('active', 'resolved', 'archived');
CREATE TYPE pet_species   AS ENUM ('dog', 'cat', 'other');
CREATE TYPE pet_size      AS ENUM ('small', 'medium', 'large');

CREATE TABLE reports (
  id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          report_type     NOT NULL,
  species       pet_species     NOT NULL,
  size          pet_size        NOT NULL,
  description   TEXT,
  photo_url     TEXT,
  location      GEOMETRY(Point, 4326) NOT NULL,
  zone_text     TEXT,
  contact_email TEXT,
  status        report_status   NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Spatial index for ST_DWithin radius queries
CREATE INDEX reports_location_gist ON reports USING GIST (location);

-- Supporting indexes for common filter combinations
CREATE INDEX reports_status_idx     ON reports (status);
CREATE INDEX reports_type_idx       ON reports (type);
CREATE INDEX reports_species_idx    ON reports (species);
CREATE INDEX reports_created_at_idx ON reports (created_at DESC);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER reports_set_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
