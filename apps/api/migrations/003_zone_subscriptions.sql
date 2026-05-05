CREATE TABLE zone_subscriptions (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT        NOT NULL,
  center     GEOMETRY(Point, 4326) NOT NULL,
  radius_km  INTEGER     NOT NULL CHECK (radius_km > 0 AND radius_km <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial index for overlap queries when a new report is created
CREATE INDEX zone_subscriptions_center_gist ON zone_subscriptions USING GIST (center);
CREATE INDEX zone_subscriptions_email_idx   ON zone_subscriptions (email);
