"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const intimacaoController_1 = require("./controllers/intimacaoController");
const auth_1 = require("./middlewares/auth");
const routes_2 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(routes_1.default);
app.listen(3000, () => {
    console.log("API rodando http://localhost:3000");
});
app.get("/", (req, res) => {
    res.send("API funcionando 🚀");
});
app.use(errorHandler_1.errorHandler);
routes_2.default.get("/intimacoes", auth_1.auth, intimacaoController_1.listIntimacoes);
