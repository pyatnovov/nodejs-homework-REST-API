const { Schema, model } = require("mongoose");
const Joi = require("joi");
const contactSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

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
const schems = {
  addSchema,
  updateFavoritSchema,
};

const Contact = model("contact", contactSchema);

module.exports = { Contact, schems };
