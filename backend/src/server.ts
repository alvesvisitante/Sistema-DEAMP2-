import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import routes from "./routes/intimacoes"
import { errorHandler } from "./middlewares/errorHandler"

dotenv.config()

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())

// rota de teste (antes das rotas)
app.get("/", (req, res) => {
  res.send("API funcionando 🚀")
})

// monta todas as rotas do sistema (inclui /intimacoes, /agentes, etc.)
app.use(routes)

// handler de erro sempre por último
app.use(errorHandler)

const PORT = Number(process.env.PORT) || 3000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando http://localhost:${PORT}`)
})