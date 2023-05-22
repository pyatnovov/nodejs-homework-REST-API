const express = require("express");
const router = express.Router();
const { schems, User } = require("../../models/user");

router.post("/register", async (req, res, next) => {
  try {
    const { error } = schems.registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, { message: "missing required name field" });
    }
    const result = await User.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
