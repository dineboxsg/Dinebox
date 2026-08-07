ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE site_settings ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);

ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_key_check;
ALTER TABLE site_settings ADD CONSTRAINT site_settings_key_check CHECK (key ~ '^[a-z0-9_]+$');
