import User from '../../model/user'
import { createServer } from '../..'

let server: any

beforeEach(async () => {
  server = await createServer()
})

test("verifyPassHandler should throw with 401 when user doesn't exist", async () => {
  const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce(null)

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyPassword',
    payload: { mobile: '27555555555', password: 'test' }
  })

  expect(res.result.statusCode).toBe(401)
  expect(spy).toBeCalled()
})

test("verifyPassHandler should throw with 401 when password hash doesn't match", async () => {
  const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce({
    mobile: '27555555555',
    passwordHash: 'xyz',
    salt: '12345',
    scope: ['test']
  })

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyPassword',
    payload: { mobile: '27555555555', password: 'test' }
  })

  expect(res.result.statusCode).toBe(401)
  expect(spy).toBeCalled()
})

test('verifyPassHandler should return 200 and the user scope when the user exists and the password hash matches', async () => {
  const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce({
    mobile: '27555555555',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    scope: ['test']
  })

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyPassword',
    payload: { mobile: '27555555555', password: 'test' }
  })

  expect(res.result).toMatchObject({ scope: ['test'] })
  expect(spy).toBeCalled()
})

test('verifyPassHandler should throw when User.findOne throws', async () => {
  const spy = jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
    throw new Error('boom')
  })
  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyPassword',
    payload: { mobile: '27555555555', password: 'test' }
  })
  expect(res.result.statusCode).toBe(500)

  expect(spy).toBeCalled()
})
