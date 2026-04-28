CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

CREATE TABLE IF NOT EXISTS credentials (
  id           VARCHAR(36)  PRIMARY KEY,
  user_id      VARCHAR(36)  NOT NULL UNIQUE,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL,
  password_salt VARCHAR(32)  NOT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         VARCHAR(36) PRIMARY KEY,
  user_id    VARCHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP   NOT NULL,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id    (user_id)
);
