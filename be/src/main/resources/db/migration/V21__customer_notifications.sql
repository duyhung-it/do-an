ALTER TABLE app_notifications
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_app_notifications_user_created
    ON app_notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_notifications_user_read
    ON app_notifications (user_id, is_read);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type app_notification_type NOT NULL,
  label VARCHAR(200) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('inApp', 'email', 'sms', 'push')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_notification_preferences_user_type_channel UNIQUE (user_id, type, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user
    ON notification_preferences (user_id);
