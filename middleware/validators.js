const { check, validationResult } = require("express-validator");

// Validattion rules for the user registration route
const registerRules = () => {
  return [
    // check('name') looks in req.body, req.params, req.query, etc. for the 'name' field
    check("name", "Name is required").not().isEmpty().trim().escape(),

    // check('email') to see if it is a valid email format
    check("email", "Please include a valid email").isEmail().normalizeEmail(),

    // check('password') to ensure it is at least 8 characters long
    check("password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
  ];
};

// A middleware to handle the result of the validation
const validate = (req, res, next) => {
  // validationResult(req) extracts the validation errors from a request
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    // If there are no errors, continue to the next middleware (the route handler)
    return next();
  }

  //   If there are errors, send a 400 response with the array of errors
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    errors: extractedErrors,
  });
};

module.exports = {
  registerRules,
  validate,
};
