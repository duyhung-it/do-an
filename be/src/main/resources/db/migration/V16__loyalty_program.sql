CREATE TYPE loyalty_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND');
CREATE TYPE loyalty_transaction_type AS ENUM ('EARN', 'REDEEM', 'EXPIRE', 'BONUS');
CREATE TYPE loyalty_reward_category AS ENUM ('VOUCHER', 'GIFT', 'SERVICE', 'UPGRADE');

CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE,
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(200) NOT NULL DEFAULT '',
  tier loyalty_tier NOT NULL DEFAULT 'BRONZE',
  points INT NOT NULL DEFAULT 0 CHECK (points >= 0),
  total_earned_points INT NOT NULL DEFAULT 0 CHECK (total_earned_points >= 0),
  total_spend BIGINT NOT NULL DEFAULT 0 CHECK (total_spend >= 0),
  points_expiry DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '12 months')::date,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  type loyalty_transaction_type NOT NULL,
  points INT NOT NULL,
  balance_after INT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  reward_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(300) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  points_cost INT NOT NULL CHECK (points_cost > 0),
  category loyalty_reward_category NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  stock INT NOT NULL DEFAULT -1 CHECK (stock >= -1),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_code VARCHAR(80) NOT NULL UNIQUE,
  reward_id UUID NOT NULL REFERENCES loyalty_rewards(id),
  loyalty_program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  points_cost INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions(customer_id, created_at DESC);
CREATE INDEX idx_loyalty_transactions_program ON loyalty_transactions(loyalty_program_id, created_at DESC);
CREATE UNIQUE INDEX idx_loyalty_transactions_order_earn ON loyalty_transactions(order_id, type) WHERE type = 'EARN';
CREATE INDEX idx_loyalty_rewards_available ON loyalty_rewards(available, category);
CREATE INDEX idx_loyalty_redemptions_customer ON loyalty_reward_redemptions(customer_id, created_at DESC);

INSERT INTO loyalty_programs (
  id, customer_id, customer_name, customer_email, tier, points, total_earned_points, total_spend, points_expiry, joined_at
)
VALUES
  ('dd000000-0001-4000-8000-000000000001', 'bc000000-0001-4000-8000-000000000001', 'QA Customer 01', 'qa01@cellphones.local', 'BRONZE', 650, 650, 12000000, CURRENT_DATE + 365, NOW() - INTERVAL '120 days'),
  ('dd000000-0001-4000-8000-000000000003', 'bc000000-0001-4000-8000-000000000003', 'QA Customer 03', 'qa03@cellphones.local', 'SILVER', 1400, 1800, 45000000, CURRENT_DATE + 365, NOW() - INTERVAL '200 days'),
  ('dd000000-0001-4000-8000-000000000008', 'bc000000-0001-4000-8000-000000000008', 'QA Customer 08', 'qa08@cellphones.local', 'GOLD', 6200, 7200, 120000000, CURRENT_DATE + 365, NOW() - INTERVAL '260 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO loyalty_transactions (
  id, loyalty_program_id, customer_id, type, points, balance_after, description, order_id, created_at
)
VALUES
  ('dd000000-0002-4000-8000-000000000001', 'dd000000-0001-4000-8000-000000000001', 'bc000000-0001-4000-8000-000000000001', 'EARN', 120, 650, 'Tich diem tu don hang QA-ADMIN-0001', 'bb000000-0001-4000-8000-000000000001', NOW() - INTERVAL '20 days'),
  ('dd000000-0002-4000-8000-000000000003', 'dd000000-0001-4000-8000-000000000003', 'bc000000-0001-4000-8000-000000000003', 'EARN', 80, 1400, 'Tich diem tu don hang QA-ADMIN-0003', 'bb000000-0001-4000-8000-000000000003', NOW() - INTERVAL '10 days'),
  ('dd000000-0002-4000-8000-000000000004', 'dd000000-0001-4000-8000-000000000003', 'bc000000-0001-4000-8000-000000000003', 'REDEEM', -400, 1320, 'Doi thuong: Voucher giam 100.000 VND', NULL, NOW() - INTERVAL '8 days'),
  ('dd000000-0002-4000-8000-000000000008', 'dd000000-0001-4000-8000-000000000008', 'bc000000-0001-4000-8000-000000000008', 'BONUS', 500, 6200, 'Thuong diem thanh vien vang', NULL, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO loyalty_rewards (id, name, description, points_cost, category, available, stock, image_url)
VALUES
  ('dd000000-0003-4000-8000-000000000001', 'Voucher giam 100.000 VND', 'Ap dung cho don hang tu 500.000 VND tro len.', 400, 'VOUCHER', TRUE, 50, 'https://cdn.cellphones.vn/rewards/voucher-100k.jpg'),
  ('dd000000-0003-4000-8000-000000000002', 'Op lung silicon mien phi', 'Nhan tai cua hang hoac giao hang kem don tiep theo.', 800, 'GIFT', TRUE, 20, 'https://cdn.cellphones.vn/rewards/iphone-case.jpg'),
  ('dd000000-0003-4000-8000-000000000003', 'Nang cap bao hanh them 6 thang', 'Gia han bao hanh cho mot san pham dang active warranty.', 1200, 'SERVICE', TRUE, -1, 'https://cdn.cellphones.vn/rewards/warranty-extend.jpg'),
  ('dd000000-0003-4000-8000-000000000004', 'Reward an cho admin QA', 'Khong hien thi voi customer.', 2000, 'UPGRADE', FALSE, 10, NULL)
ON CONFLICT (id) DO NOTHING;
