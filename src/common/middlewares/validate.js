export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      console.log(result.error);
      return next(result.error); // ZodError → errorHandler로 전달
    }

    req.validatedData = result.data;
    next();
  };
};
