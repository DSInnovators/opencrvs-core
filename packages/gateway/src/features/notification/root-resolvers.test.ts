import { resolvers } from './root-resolvers'
import * as fetch from 'jest-fetch-mock'

describe('Notification root resolvers', () => {
  describe('listNotifications()', () => {
    it('returns an array of composition results', async () => {
      fetch.mockResponseOnce(JSON.stringify({ entry: [{}, {}] }))
      // @ts-ignore
      const compositions = await resolvers.Query.listNotifications(
        {},
        { status: 'preliminary' }
      )

      expect(compositions).toBeDefined()
      expect(compositions).toBeInstanceOf(Array)
      expect(compositions).toHaveLength(2)
    })
  })
  describe('createNotification', () => {
    it('posting the mutation', async () => {
      // @ts-ignore
      const result = await resolvers.Mutation.createNotification(
        {},
        { createAt: new Date() }
      )

      expect(result).toBeDefined()
    })
  })
})
