-- AlterTable
ALTER TABLE "stores" ADD COLUMN "owner_id" TEXT NOT NULL DEFAULT '';

-- remove o default após preencher (nova instalação começa sem dados)
ALTER TABLE "stores" ALTER COLUMN "owner_id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "stores_owner_id_idx" ON "stores"("owner_id");
