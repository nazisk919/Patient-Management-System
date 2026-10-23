const validate = (schema) => {
  return (req, res, next) => {
    // Check if the schema expects a wrapped object with { body, params, query }
    const isWrappedSchema =
      schema.shape && (schema.shape.body || schema.shape.params || schema.shape.query);

    const dataToValidate = isWrappedSchema
      ? { body: req.body, params: req.params, query: req.query }
      : req.body;

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0]?.message || "Validation Error",
      });
    }

    if (isWrappedSchema) {
      if (result.data.body !== undefined) req.body = result.data.body;
    } else {
      req.body = result.data;
    }

    next();
  };
};

module.exports = validate;