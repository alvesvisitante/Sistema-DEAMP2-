import { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function listAgentes(req: Request, res: Response, next: NextFunction) {
  try {
    const agentes = await prisma.agente.findMany({
      orderBy: { createdAt: "desc" },
    })
    return res.json(agentes)
  } catch (err) {
    return next(err)
  }
}

export async function createAgente(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      nome,
      matricula,
      cargo,
      cpf,
      telefone,
      email,
      status,
      data_admissao,
    } = req.body

    if (!nome || typeof nome !== "string") {
      return res.status(400).json({ message: "nome é obrigatório" })
    }

    const agente = await prisma.agente.create({
      data: {
        nome,
        matricula,
        cargo: cargo || null,
        cpf: cpf || null,
        telefone: telefone || null,
        email: email || null,
        status: status || "ativo",
        data_admissao: data_admissao ? new Date(data_admissao) : null,
      },
    })

    return res.status(201).json(agente)
  } catch (err) {
    return next(err)
  }
}

export async function updateAgente(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const {
      nome,
      matricula,
      cargo,
      cpf,
      telefone,
      email,
      status,
      data_admissao,
    } = req.body

    const agente = await prisma.agente.update({
      where: { id },
      data: {
        nome,
        matricula,
        cargo: cargo || null,
        cpf: cpf || null,
        telefone: telefone || null,
        email: email || null,
        status: status || "ativo",
        data_admissao: data_admissao ? new Date(data_admissao) : null,
      },
    })

    return res.json(agente)
  } catch (err) {
    return next(err)
  }
}

export async function deleteAgente(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    await prisma.agente.delete({ where: { id } })
    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
}