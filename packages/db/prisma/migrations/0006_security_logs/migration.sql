-- Audit log de eventos sensíveis de auth/RBAC (role trocada, vínculo parent criado/verificado, etc).

CREATE TABLE "security_logs" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "event_type" TEXT NOT NULL,
  "event_description" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "security_logs_user_id_idx" ON "security_logs"("user_id");
CREATE INDEX "security_logs_event_type_idx" ON "security_logs"("event_type");

-- RLS habilitado como nas demais tabelas; apenas o backend (service role) acessa.
ALTER TABLE "security_logs" ENABLE ROW LEVEL SECURITY;
