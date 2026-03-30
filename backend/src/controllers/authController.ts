import { Request, Response } from "express"
import { prisma } from "../database/prisma"
import bcrypt from "bcrypt"
import { generateToken } from "../utils/jwt"

export async function register(req: Request, res: Response) {
  const { email, password } = req.body
  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hash },
  })

  res.json({ id: user.id, email: user.email })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(400).json({ error: "Usuário não existe" })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(400).json({ error: "Senha inválida" })

  const token = generateToken(user.id)
  res.json({ token })
}