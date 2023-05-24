const express = require("express");
const { Contact } = require("../../models/contacts");
const router = express.Router();
const isValidId = require("../../middlewares/isValidId");
const { HttpError } = require("../../helpers");
const { schems } = require("../../models/contacts");
const authentication = require("../../middlewares/authentication");

router.get("/", authentication, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const result = await Contact.find({ owner }, "-createdAt -updatedAt", {
      skip,
      limit,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authentication, isValidId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Contact.findById(id);
    if (!result) {
      throw HttpError(404, { message: "Not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authentication, isValidId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const contactForRemove = await Contact.findByIdAndRemove(id);
    if (!contactForRemove) {
      throw HttpError(404, { message: "Not found" });
    }
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.post("/", authentication, async (req, res, next) => {
  try {
    const { error } = schems.addSchema.validate(req.body);
    if (error) {
      throw HttpError(400, { message: "missing required name field" });
    }
    const { _id: owner } = req.user;
    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
router.put("/:id", authentication, isValidId, async (req, res, next) => {
  try {
    const { error } = schems.addSchema.validate(req.body);
    if (error) {
      throw HttpError(400, { message: "missing fields" });
    }
    const { id } = req.params;
    const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!result) {
      throw HttpError(404, { message: "Not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
router.patch(
  "/:id/favorite",
  authentication,
  isValidId,
  async (req, res, next) => {
    try {
      const { error } = schems.updateFavoritSchema.validate(req.body);
      if (error) {
        throw HttpError(400, { message: "missing field favorite" });
      }
      const { id } = req.params;
      const result = await Contact.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!result) {
        throw HttpError(404, { message: "Not found" });
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
