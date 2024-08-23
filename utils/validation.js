const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(6)
    .regex(/[A-Za-z]/, "letters")
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.regex.base": "Password must contain at least one letter",
      "any.required": "Password is required",
    }),
});

// Validate request body using the schema
const validateAuth = (data) => {
  const { error } = userSchema.validate(data, { allowUnknown: true });
  return error;
};

module.exports = { validateAuth };
