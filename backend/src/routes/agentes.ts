import express from "express"
import {
  listAgentes,
  createAgente,
  updateAgente,
  deleteAgente,
} from "../controllers/agenteController"

const router = express.Router()

router.get("/", listAgentes)
router.post("/", createAgente)
router.put("/:id", updateAgente)
router.delete("/:id", deleteAgente)

export default router