import * as Joi from 'joi'

export const requestSchema = Joi.object({
  msisdn: Joi.string().required(),
  message: Joi.string().required()
})

export const declarationNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  trackingid: Joi.string()
    .length(7)
    .required(),
  name: Joi.string().required()
})

export const registrationNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  name: Joi.string().required()
})
