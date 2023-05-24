const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");
const bcrypt = require("bcrypt");
const { HttpError } = require("../../helpers");
const { schems, User } = require("../../models/user");

router.get("/", async (req, res, next) => {
  const result = await User.find();
  res.json(result);
});

router.post("/register", async (req, res, next) => {
  try {
    const { error } = schems.registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, { message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, { message: "Email already in use" });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ ...req.body, password: hashPassword });
    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, { message: "Email or password is wrong" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, { message: "Email or password is wrong" });
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

    res.json({
      token,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
