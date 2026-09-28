const { ZodError } = require('zod');

// Generic validation middleware factory.
// Pass it a zod schema, it returns an Express middleware that validates
// req.body against that schema before the request reaches the controller.
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        next(err); // ZodError flows to errorHandler.js
    }
};

module.exports = validate;