"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntimacao = createIntimacao;
exports.listIntimacoes = listIntimacoes;

const prisma_1 = require("../database/prisma");

async function createIntimacao(req, res) {
    try {
        const { titulo, descricao, status } = req.body;

        if (!titulo || !descricao || !status) {
            return res.status(400).json({ message: "Campos obrigatórios faltando" });
        }

        const data = await prisma_1.prisma.intimacao.create({
            data: { titulo, descricao, status }
        });

        return res.status(201).json(data);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro ao criar intimação" });
    }
}

async function listIntimacoes(req, res) {
    try {
        const data = await prisma_1.prisma.intimacao.findMany({
            orderBy: { createdAt: "desc" }
        });

        return res.json(data);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro ao listar intimações" });
    }
}