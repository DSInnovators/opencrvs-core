import { createToken } from '../authenticate/service'

export interface IDecodedToken {
  role: string
  iat: string
  exp: string
  sub: string
}

export async function refreshToken(payload: IDecodedToken): Promise<string> {
  return createToken(payload.sub, payload.role)
}
