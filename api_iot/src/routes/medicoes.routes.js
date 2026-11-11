const express = require("express");
const { cadastrar, listar } = require("../controllers/medicoes.controllers");

const router = express.Router();

router.get("/listar", listar);
router.post("/medicoes", (req, res) => {
  console.log("Medição recebida:", req.body);
  res.status(201);
  return cadastrar(req, res);
});

module.exports = router;
