const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { SECRET_KEY, PROJECT_URL } = require("../../config");
const bcrypt = require("bcrypt");
const { HttpError, SendEmail, sendEmail } = require("../../helpers");
const { schems, User } = require("../../models/user");
const authentication = require("../../middlewares/authentication");
const fs = require("fs/promises");
const gravatar = require("gravatar");
const upload = require("../../middlewares/upload");
const path = require("path");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const avatarDir = path.join(__dirname, "../../", "public", "avatars");

router.get("/", async (req, res, next) => {
  const result = await User.find();
  res.json(result);
});
router.get("/current", authentication, async (req, res, next) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
});

router.post("/register", async (req, res, next) => {
  try {
    const { error } = schems.registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, { message: "Validation error" });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, { message: "Email already in use" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const verificationCode = nanoid();
    const avatarURL = gravatar.url(email);

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationCode,
    });
    const verifyEmail = {
      to: email,
      subject: "Varify email",
      html: `<a target="_blank" href="${PROJECT_URL}/user/auth/verify/${verificationCode}"></a>`,
    };
    await sendEmail(verifyEmail);

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
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authentication, async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json({
    message: "Logout success",
  });
});

router.patch(
  "/avatars",
  authentication,
  upload.single("avatar"),
  async (req, res) => {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    try {
      const avatar = await Jimp.read(resultUpload);
      await avatar.resize(250, 250).write(resultUpload);

      await User.findByIdAndUpdate(_id, { avatarURL });

      res.json({
        avatarURL,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;
