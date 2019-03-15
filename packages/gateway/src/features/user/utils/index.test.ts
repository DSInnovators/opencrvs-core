import { logger } from '../../../logger'
import * as fetch from 'jest-fetch-mock'
import { getUserMobile, convertToLocal } from './'

describe('Verify utility functions', () => {
  it('gets mobile number exists', async () => {
    expect(getUserMobile('1', { Authorization: 'bearer acd ' })).toBeDefined()
  })
  it('gets mobile number logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockImplementationOnce(() => {
      throw new Error('Mock Error')
    })
    getUserMobile('1', { Authorization: 'bearer acd ' })
    expect(logSpy).toHaveBeenLastCalledWith(
      'Unable to retrieve mobile for error : Error: Mock Error'
    )
  })
  it('replaces country code', async () => {
    expect(convertToLocal('+8801711111111', 'bgd')).toBe('01711111111')
  })
})
