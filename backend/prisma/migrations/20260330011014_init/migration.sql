-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" TEXT,
    "cargo" TEXT,
    "cpf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "data_admissao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intimacao" (
    "id" TEXT NOT NULL,
    "numero_intimacao" TEXT,
    "intimado_nome" TEXT NOT NULL,
    "intimado_cpf" TEXT,
    "intimado_endereco" TEXT,
    "intimado_telefone" TEXT,
    "motivo" TEXT NOT NULL,
    "descricao_motivo" TEXT,
    "data_intimacao" TIMESTAMP(3) NOT NULL,
    "data_comparecimento" TIMESTAMP(3),
    "local_comparecimento" TEXT,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "documentos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agenteId" TEXT,

    CONSTRAINT "Intimacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Agente_matricula_key" ON "Agente"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Intimacao_numero_intimacao_key" ON "Intimacao"("numero_intimacao");

-- AddForeignKey
ALTER TABLE "Intimacao" ADD CONSTRAINT "Intimacao_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
