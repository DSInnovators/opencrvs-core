import { searchComposition } from './service'
import { client } from 'src/elasticsearch/client'

describe('elasticsearch db helper', async () => {
  let searchSpy

  beforeAll(() => {
    searchSpy = jest.spyOn(client, 'search')
  })

  it('should index a composition with proper configuration', async () => {
    const searchQuery = {
      query: 'some query',
      trackingId: 'dummy',
      contactNumber: 'dummy',
      registrationNumber: 'dummy',
      event: 'EMPTY_STRING',
      status: 'EMPTY_STRING',
      applicationLocationId: 'EMPTY_STRING',
      from: 0,
      size: 10
    }
    searchComposition(searchQuery)
    expect(searchSpy).toBeCalled()
  })

  it('should index a composition with minimum configuration', async () => {
    const searchQuery = {
      from: 0,
      size: 10
    }
    searchComposition(searchQuery)
    expect(searchSpy).toBeCalled()
  })

  afterAll(() => {
    searchSpy.mockRestore()
  })
})
