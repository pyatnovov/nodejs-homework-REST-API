const express = require("express");
const contact = require("../../models/contacts");
const router = express.Router();
const isValidId = require("../../middlewares/isValidId");
const Joi = require("joi");
const { HttpError } = require("../../helpers");
const addSchema = Joi.object({
  name: Joi.string().min(4).max(20).required(),
  email: Joi.string().min(4).max(20).email().required(),
  phone: Joi.string()
    .min(4)
    .max(50)
    .pattern(/^\+|\d[\s\d\-\(\)]*\d$/)
    .required(),
  favorite: Joi.boolean(),
});
const updateFavoritSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

router.get("/", async (req, res, next) => {
  try {
    const result = await contact.find();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isValidId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await contact.findById(id);
    if (!result) {
      throw HttpError(404, { message: "Not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isValidId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const contactForRemove = await contact.findByIdAndRemove(id);
    if (!contactForRemove) {
      throw HttpError(404, { message: "Not found" });
    }
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body);
    if (error) {
      throw HttpError(400, { message: "missing required name field" });
    }
    const result = await contact.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
router.put("/:id", isValidId, async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body);
    if (error) {
      throw HttpError(400, { message: "missing fields" });
    }
    const { id } = req.params;
    const result = await contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!result) {
      throw HttpError(404, { message: "Not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router.patch("/:id/favorite", isValidId, async (req, res, next) => {
  try {
    const { error } = updateFavoritSchema.validate(req.body);
    if (error) {
      throw HttpError(400, { message: "missing field favorite" });
    }
    const { id } = req.params;
    const result = await contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!result) {
      throw HttpError(404, { message: "Not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
