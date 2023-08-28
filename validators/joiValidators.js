import joi from 'joi';

export const studentRegDataValidation = (data) => {
  const schema = joi.object({
    firstName: joi.string().trim().required(),

    lastName: joi.string().trim().required(),

    email: joi.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Email is not a valid email pattern'
      }),

      learningTrack: joi.string().required(),

    password: joi.string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
      }),

      confirmPassword: joi.string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
      })

  }).strict();

  return schema.validate(data);
}


export const studentLoginValidator = (data) => {
  const schema = joi.object({
    email: joi.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Email is not a valid email pattern'
      }),

    password: joi.string().min(8).required()

  }).strict();

  return schema.validate(data);
}


export const educatorRegDataValidation = (data) => {
  const schema = joi.object({
    firstName: joi.string().trim().required(),

    lastName: joi.string().trim().required(),

    companyEmail: joi.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Email is not a valid email pattern'
      }),

      track: joi.string().required(),

    password: joi.string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
      }),

      confirmPassword: joi.string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain minimum of eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.'
      })

  }).strict();

  return schema.validate(data);
}


export const educatorLoginValidator = (data) => {
  const schema = joi.object({
    companyEmail: joi.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Email is not a valid email pattern'
      }),

    password: joi.string().min(8).required()

  }).strict();

  return schema.validate(data);
}