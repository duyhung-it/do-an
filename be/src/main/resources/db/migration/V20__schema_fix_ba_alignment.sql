-- V20: Schema fix to align with BA-docs
-- 1. branches: add district, city, lat, lng, working_hours
-- 2. staff_members: add phone, branch_id, joined_at
-- 3. admin_settings: migrate keys to snake_case per BA spec
-- 4. activity_logs: add action/entity filter indexes

-- ============================================================
-- 1. branches — add missing columns
-- ============================================================
ALTER TABLE branches
    ADD COLUMN IF NOT EXISTS district      VARCHAR(255),
    ADD COLUMN IF NOT EXISTS city          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS working_hours VARCHAR(255),
    ADD COLUMN IF NOT EXISTS lat           DECIMAL(10, 7),
    ADD COLUMN IF NOT EXISTS lng           DECIMAL(10, 7);

-- Backfill city/district from existing address data (match ASCII strings from V19)
UPDATE branches SET city = 'TP.HCM',   district = 'Quan 3'       WHERE address ILIKE '%Q.3%';
UPDATE branches SET city = 'TP.HCM',   district = 'Quan Tan Binh' WHERE address ILIKE '%Tan Binh%';
UPDATE branches SET city = 'TP.HCM',   district = 'Quan Go Vap'   WHERE address ILIKE '%Go Vap%';
UPDATE branches SET city = 'TP.HCM',   district = 'Quan 10'       WHERE address ILIKE '%Q.10%';
UPDATE branches SET city = 'TP.HCM',   district = 'Quan 5'        WHERE address ILIKE '%Q.5%';
UPDATE branches SET city = 'TP.HCM',   district = 'Quan 1'        WHERE address ILIKE '%Q.1%' AND city IS NULL;
UPDATE branches SET city = 'Ha Noi',   district = 'Quan Cau Giay'  WHERE address ILIKE '%Cau Giay%';
UPDATE branches SET city = 'Ha Noi',   district = 'Quan Ba Dinh'   WHERE address ILIKE '%Ba Dinh%';
UPDATE branches SET city = 'Ha Noi',   district = 'Quan Dong Da'   WHERE address ILIKE '%Dong Da%';
UPDATE branches SET city = 'Da Nang',  district = 'Quan Hai Chau'  WHERE address ILIKE '%Hai Chau%';
UPDATE branches SET city = 'Can Tho',  district = 'Quan Ninh Kieu' WHERE address ILIKE '%Ninh Kieu%';
-- Catch-all: HCM for remaining unset
UPDATE branches SET city = 'TP.HCM', district = 'Quan 1' WHERE city IS NULL;

-- Backfill working_hours default
UPDATE branches SET working_hours = '8:00 - 22:00 (Thu 2 - Chu nhat)' WHERE working_hours IS NULL;

-- Backfill lat/lng (approximate coordinates per city — good enough for demo)
UPDATE branches SET lat = 10.7769, lng = 106.6955 WHERE city = 'TP.HCM'  AND lat IS NULL;
UPDATE branches SET lat = 21.0285, lng = 105.8542 WHERE city = 'Ha Noi'  AND lat IS NULL;
UPDATE branches SET lat = 16.0544, lng = 108.2022 WHERE city = 'Da Nang' AND lat IS NULL;
UPDATE branches SET lat = 10.0452, lng = 105.7469 WHERE city = 'Can Tho' AND lat IS NULL;
-- Catch-all lat/lng for any remaining (default HCM coords)
UPDATE branches SET lat = 10.7769, lng = 106.6955 WHERE lat IS NULL;

-- ============================================================
-- 2. staff_members — add missing columns
-- ============================================================
ALTER TABLE staff_members
    ADD COLUMN IF NOT EXISTS phone      VARCHAR(20),
    ADD COLUMN IF NOT EXISTS branch_id  UUID REFERENCES branches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS joined_at  DATE;

-- Backfill joined_at from created_at
UPDATE staff_members SET joined_at = created_at::date WHERE joined_at IS NULL;

-- Backfill phone placeholder
UPDATE staff_members SET phone = '0901234567' WHERE phone IS NULL;

-- Assign first 6 active branches to staff members (round-robin, demo purpose)
DO $$
DECLARE
    branch_ids UUID[];
    staff_ids  UUID[];
    i          INT;
BEGIN
    -- Collect up to 6 active branch IDs
    SELECT ARRAY(SELECT id FROM branches WHERE is_active = true LIMIT 6) INTO branch_ids;
    -- Collect all staff IDs ordered by created_at
    SELECT ARRAY(SELECT id FROM staff_members ORDER BY created_at) INTO staff_ids;

    -- Only proceed if we have both
    IF array_length(branch_ids, 1) > 0 AND array_length(staff_ids, 1) > 0 THEN
        FOR i IN 1..array_length(staff_ids, 1) LOOP
            UPDATE staff_members
            SET branch_id = branch_ids[((i - 1) % array_length(branch_ids, 1)) + 1]
            WHERE id = staff_ids[i];
        END LOOP;
    END IF;
END $$;

-- ============================================================
-- 3. admin_settings — migrate keys to snake_case per BA-docs
-- ============================================================
-- Remove old camelCase entries and insert snake_case versions
DELETE FROM admin_settings WHERE setting_key IN (
    'siteName', 'siteDescription', 'taxRate', 'minOrderValue',
    'defaultPageSize', 'maintenanceMode', 'emailNotifications',
    'autoApproveProducts', 'maxUploadSize'
);

INSERT INTO admin_settings (setting_key, setting_value, updated_at)
VALUES
    ('site_name',                    '"CELLPHONES"'::jsonb,                                              NOW()),
    ('site_description',             '"He thong ban le dien thoai va phu kien hang dau Viet Nam"'::jsonb, NOW()),
    ('hotline',                      '"1800 2097"'::jsonb,                                               NOW()),
    ('address',                      '"123 Ly Thuong Kiet, Q.10, TP.HCM"'::jsonb,                       NOW()),
    ('currency',                     '"VND"'::jsonb,                                                     NOW()),
    ('tax_rate',                     '10'::jsonb,                                                        NOW()),
    ('maintenance_mode',             'false'::jsonb,                                                     NOW()),
    ('return_window_days',           '7'::jsonb,                                                         NOW()),
    ('loyalty_points_per_100k',      '1'::jsonb,                                                         NOW()),
    ('email_notifications_enabled',  'true'::jsonb,                                                      NOW()),
    ('default_page_size',            '20'::jsonb,                                                        NOW()),
    ('auto_approve_products',        'false'::jsonb,                                                     NOW()),
    ('max_upload_size_mb',           '20'::jsonb,                                                        NOW())
ON CONFLICT (setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value,
        updated_at    = NOW();

-- ============================================================
-- 4. activity_logs — add action/entity columns indexes for filter
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_activity_logs_action      ON admin_activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON admin_activity_logs (entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id    ON admin_activity_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at  ON admin_activity_logs (created_at DESC);
