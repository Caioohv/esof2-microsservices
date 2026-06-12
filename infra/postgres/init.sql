-- Cria um banco isolado por serviço (cada um tem sua própria tabela _prisma_migrations).
-- Executado apenas na primeira inicialização do volume do Postgres.
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE store_db;
