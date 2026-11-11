const express = require("express");
const path = require("path");
const router = express.Router();

const pastaWeb = path.join(__dirname, "..", "..", "..", "web");
router.use(express.static(pastaWeb));
router.get("/", (_req, res) => res.sendFile(path.join(pastaWeb, "medicoes.html")));
router.use(require("./medicoes.routes"));

module.exports = router;
