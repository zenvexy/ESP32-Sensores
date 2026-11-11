const prisma = require("../data/prisma");

const listar = async (req, res) => {
    const lista = await prisma.medicao.findMany();

    res.json(lista).status(200).end();
};

const cadastrar = async (req, res) => {
    const item = await prisma.medicao.create({
        data: req.body
    });

    res.json(item).status(201).end();
};

module.exports = {
    cadastrar,
    listar
}
