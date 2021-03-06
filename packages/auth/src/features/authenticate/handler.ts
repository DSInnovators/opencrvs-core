/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from 'hapi'
import * as Joi from 'joi'
import {
  authenticate,
  storeUserInformation,
  createToken,
  generateAndSendVerificationCode
} from '@auth/features/authenticate/service'
import { generateNonce } from '@auth/features/verifyCode/service'
import { unauthorized } from 'boom'
import {
  WEB_USER_JWT_AUDIENCES,
  JWT_ISSUER,
  NOTIFICATION_API_USER_AUDIENCE,
  VALIDATOR_API_USER_AUDIENCE,
  CHATBOT_API_USER_AUDIENCE
} from '@auth/constants'

interface IAuthPayload {
  username: string
  password: string
}

interface IAuthResponse {
  nonce: string
  mobile: string
  status: string
  token?: string
}

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const payload = request.payload as IAuthPayload
  let result

  try {
    result = await authenticate(payload.username, payload.password)
  } catch (err) {
    throw unauthorized()
  }

  const nonce = generateNonce()
  const response: IAuthResponse = {
    mobile: result.mobile,
    status: result.status,
    nonce
  }

  const isPendingUser = response.status && response.status === 'pending'
  const isNotificationAPIUser = result.scope.indexOf('notification-api') > -1
  const isValidatorAPIUser = result.scope.indexOf('validator-api') > -1
  const isChatbotAPIUser = result.scope.indexOf('chatbot-api') > -1

  // directly send the token if the user is pending or an API user
  if (
    isPendingUser ||
    isNotificationAPIUser ||
    isValidatorAPIUser ||
    isChatbotAPIUser
  ) {
    response.token = await createToken(
      result.userId,
      result.scope,
      isNotificationAPIUser
        ? WEB_USER_JWT_AUDIENCES.concat([NOTIFICATION_API_USER_AUDIENCE])
        : isValidatorAPIUser
        ? WEB_USER_JWT_AUDIENCES.concat([VALIDATOR_API_USER_AUDIENCE])
        : isChatbotAPIUser
        ? WEB_USER_JWT_AUDIENCES.concat([CHATBOT_API_USER_AUDIENCE])
        : WEB_USER_JWT_AUDIENCES,
      JWT_ISSUER
    )
  } else {
    await storeUserInformation(
      nonce,
      result.userId,
      result.scope,
      result.mobile
    )

    await generateAndSendVerificationCode(nonce, result.mobile, result.scope)
  }
  return response
}

export const requestSchema = Joi.object({
  username: Joi.string(),
  password: Joi.string()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  mobile: Joi.string(),
  status: Joi.string(),
  token: Joi.string().optional()
})
