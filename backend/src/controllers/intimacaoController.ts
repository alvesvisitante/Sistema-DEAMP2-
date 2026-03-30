import { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function listIntimacoes(req: Request, res: Response, next: NextFunction) {
  try {
    const intimacoes = await prisma.intimacao.findMany({
      orderBy: { createdAt: "desc" },
      include: { agente: true },
    })

    return res.json(intimacoes)
  } catch (err) {
    return next(err)
  }
}

export async function getIntimacaoById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    const intimacao = await prisma.intimacao.findUnique({
      where: { id },
      include: { agente: true },
    })

    if (!intimacao) {
      return res.status(404).json({ message: "Intimação não encontrada" })
    }

    return res.json(intimacao)
  } catch (err) {
    return next(err)
  }
}

export async function createIntimacao(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      numero_intimacao,
      agente_id,
      intimado_nome,
      intimado_cpf,
      intimado_endereco,
      intimado_telefone,
      motivo,
      descricao_motivo,
      data_intimacao,
      data_comparecimento,
      local_comparecimento,
      observacoes,
      status,
      documentos,
    } = req.body

    if (!intimado_nome || typeof intimado_nome !== "string") {
      return res.status(400).json({ message: "Nome do intimado é obrigatório" })
    }

    if (!motivo || typeof motivo !== "string") {
      return res.status(400).json({ message: "Motivo é obrigatório" })
    }

    if (!data_intimacao) {
      return res.status(400).json({ message: "Data da intimação é obrigatória" })
    }

    const intimacao = await prisma.intimacao.create({
      data: {
        numero_intimacao: numero_intimacao || null,
        agenteId: agente_id || null,
        intimado_nome,
        intimado_cpf: intimado_cpf || null,
        intimado_endereco: intimado_endereco || null,
        intimado_telefone: intimado_telefone || null,
        motivo,
        descricao_motivo: descricao_motivo || null,
        data_intimacao: new Date(data_intimacao),
        data_comparecimento: data_comparecimento ? new Date(data_comparecimento) : null,
        local_comparecimento: local_comparecimento || null,
        observacoes: observacoes || null,
        status: status || "pendente",
        documentos: documentos || [],
      },
    })

    return res.status(201).json(intimacao)
  } catch (err) {
    return next(err)
  }
}

export async function updateIntimacao(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const {
      numero_intimacao,
      agente_id,
      intimado_nome,
      intimado_cpf,
      intimado_endereco,
      intimado_telefone,
      motivo,
      descricao_motivo,
      data_intimacao,
      data_comparecimento,
      local_comparecimento,
      observacoes,
      status,
      documentos,
    } = req.body

    const intimacao = await prisma.intimacao.update({
      where: { id },
      data: {
        numero_intimacao,
        agenteId: agente_id || null,
        intimado_nome,
        intimado_cpf,
        intimado_endereco,
        intimado_telefone,
        motivo,
        descricao_motivo,
        data_intimacao: data_intimacao ? new Date(data_intimacao) : undefined,
        data_comparecimento: data_comparecimento ? new Date(data_comparecimento) : null,
        local_comparecimento,
        observacoes,
        status,
        documentos,
      },
    })

    return res.json(intimacao)
  } catch (err) {
    return next(err)
  }
}

export async function deleteIntimacao(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    await prisma.intimacao.delete({ where: { id } })
    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
}