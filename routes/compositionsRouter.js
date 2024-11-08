const router = require("express").Router();
const CompositionService = require("../services/compositionService");
const logError = require("../utils/logger");

router.post("/:parentId/composition", async (req, res) => {
  try {
    const response = await CompositionService().create(parseInt(req.params.parentId), req.body);
    res.status(200).json(response);
  } catch (err) {
    logError("POST Composition", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

router.put("/:parentId/composition/:materialId", async (req, res) => {
  try {
    const response = await CompositionService().update(
      parseInt(req.params.parentId),
      parseInt(req.params.materialId),
      req.body
    );
    res.status(200).json(response);
  } catch (err) {
    logError("PUT Composition", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

router.delete("/:parentId/composition/:materialId", async (req, res) => {
  try {
    const response = await CompositionService().remove(parseInt(req.params.parentId), req.params.materialId);
    res.status(200).json(response);
  } catch (err) {
    logError("DELETE Composition", err);
    res.status(err.statusCode ?? 500).json({ message: err.message });
  }
});

module.exports = router;
