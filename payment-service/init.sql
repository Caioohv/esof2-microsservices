CREATE DATABASE IF NOT EXISTS payment_db;
USE payment_db;

CREATE TABLE IF NOT EXISTS plans (
  id           VARCHAR(36)   PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  price        DECIMAL(10,2) NOT NULL,
  features     JSON          NOT NULL,
  duration_days INT          NOT NULL,
  stripe_price_id VARCHAR(100) NULL,
  active       BOOLEAN       DEFAULT TRUE,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                    VARCHAR(36)  PRIMARY KEY,
  lojista_id            VARCHAR(36)  NOT NULL,
  plan_id               VARCHAR(36)  NOT NULL,
  status                ENUM('active', 'inactive', 'cancelled', 'pending') DEFAULT 'pending',
  stripe_session_id     VARCHAR(255) NULL,
  stripe_subscription_id VARCHAR(255) NULL,
  expires_at            TIMESTAMP    NULL,
  created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lojista (lojista_id),
  INDEX idx_status  (status),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Seed: planos padrão
INSERT IGNORE INTO plans (id, name, price, features, duration_days) VALUES
  ('plan-basic-001',   'Básico',       49.90,  '["Até 5 produtos", "Suporte por email", "Agendamentos ilimitados"]',                              30),
  ('plan-pro-001',     'Profissional', 99.90,  '["Até 30 produtos", "Suporte prioritário", "Agendamentos ilimitados", "Destaque na busca"]',       30),
  ('plan-premium-001', 'Premium',      199.90, '["Produtos ilimitados", "Suporte 24/7", "Agendamentos ilimitados", "Destaque na busca", "Analytics avançado"]', 30);
