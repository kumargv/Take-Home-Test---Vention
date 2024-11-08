const router = require("express").Router();
const MaterialService = require("../services/materialService");
const logError = require("../utils/logger");

router.get("/", async (_, res) => {
  try {
    const response = await MaterialService().getAll();
    res.status(200).json(response);
  } catch (err) {
    logError("GET Materials", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const response = await MaterialService().get(parseInt(req.params.id));
    res.status(200).json(response);
  } catch (err) {
    logError("GET Material", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const response = await MaterialService().update(parseInt(req.params.id), req.body);
    res.status(200).json(response);
  } catch (err) {
    logError("PUT Material", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const response = await MaterialService().remove(parseInt(req.params.id));
    res.status(200).json(response);
  } catch (err) {
    logError("DELETE Material", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

module.exports = router;
