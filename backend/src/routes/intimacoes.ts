import { Router } from "express"
import { login, register } from "../controllers/authController"
import {
  createIntimacao,
  listIntimacoes,
  getIntimacaoById,
  updateIntimacao,
  deleteIntimacao,
} from "../controllers/intimacaoController"
import { auth } from "../middlewares/auth"
import {
  createAgente,
  deleteAgente,
  listAgentes,
  updateAgente,
} from "../controllers/agenteController"

const router = Router()

router.post("/login", login)
router.post("/register", register)

router.get("/intimacoes", listIntimacoes)
router.get("/intimacoes/:id", getIntimacaoById)
router.post("/intimacoes", createIntimacao)
router.put("/intimacoes/:id", updateIntimacao)
router.delete("/intimacoes/:id", deleteIntimacao)

// ======= AGENTES =======
router.get("/agentes", listAgentes)
router.post("/agentes", createAgente)
router.put("/agentes/:id", updateAgente)
router.delete("/agentes/:id", deleteAgente)

export default router