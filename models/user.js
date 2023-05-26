const { Schema, model } = require("mongoose");
const Joi = require("joi");
const subscriptionList = ["starter", "pro", "business"];
const userSchema = Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: subscriptionList,
      default: "starter",
    },
    token: String,
  },
  { versionKey: false, timestamps: true }
);

const registerSchema = Joi.object({
  password: Joi.string().min(6).max(20).required(),
  email: Joi.string().min(4).max(20).email().required(),
  subscription: Joi.string().validate(...subscriptionList),
});

const loginSchema = Joi.object({
  password: Joi.string().min(6).max(20).required(),
  email: Joi.string().min(4).max(20).email().required(),
});

const schems = {
  registerSchema,
  loginSchema,
};
const User = model("user", userSchema);
module.exports = { schems, User };
