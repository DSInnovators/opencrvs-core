import * as React from 'react'
import { createTestComponent, mockUserResponse } from '@register/tests/util'
import { queries } from '@register/profile/queries'
import { merge } from 'lodash'
import { v4 as uuid } from 'uuid'

import { storage } from '@register/storage'
import { createStore } from '@register/store'
import {
  RegistrarHome,
  EVENT_STATUS
} from '@register/views/RegistrarHome/RegistrarHome'
import { Spinner, GridTable } from '@opencrvs/components/lib/interface'
import {
  COUNT_REGISTRATION_QUERY,
  SEARCH_EVENTS
} from '@register/views/RegistrarHome/queries'
import { checkAuth } from '@register/profile/profileActions'
import {
  SUBMISSION_STATUS,
  storeApplication,
  createApplication,
  createReviewApplication
} from '@register/applications'
import { Event } from '@register/forms'
import moment from 'moment'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock

const mockFetchUserDetails = jest.fn()

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ],
      role: 'DISTRICT_REGISTRAR'
    }
  }
}

const mockUserData = {
  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
  type: 'Birth',
  registration: {
    status: 'DECLARED',
    contactNumber: '01622688231',
    trackingId: 'BW0UTHR',
    registrationNumber: null,
    registeredLocationId: '308c35b4-04f8-4664-83f5-9790e790cde1',
    duplicates: null,
    createdAt: '2018-05-23T14:44:58+02:00',
    modifiedAt: '2018-05-23T14:44:58+02:00'
  },
  dateOfBirth: '2010-10-10',
  childName: [
    {
      firstNames: 'Iliyas',
      familyName: 'Khan',
      use: 'en'
    },
    {
      firstNames: 'ইলিয়াস',
      familyName: 'খান',
      use: 'bn'
    }
  ],
  // TODO: When fragmentMatching work is completed, remove unnecessary result objects
  // PR: https://github.com/jembi/OpenCRVS/pull/836/commits/6302fa8f015fe313cbce6197980f1300bf4eba32
  child: {
    name: [
      {
        firstNames: 'Iliyas',
        familyName: 'Khan',
        use: 'en'
      },
      {
        firstNames: 'ইলিয়াস',
        familyName: 'খান',
        use: 'bn'
      }
    ],
    birthDate: '2010-10-10'
  },
  deceased: {
    name: [
      {
        use: '',
        firstNames: '',
        familyName: ''
      }
    ],
    deceased: {
      deathDate: ''
    }
  },
  informant: {
    individual: {
      telecom: [
        {
          system: '',
          use: '',
          value: ''
        }
      ]
    }
  },
  dateOfDeath: null,
  deceasedName: null,
  createdAt: '2018-05-23T14:44:58+02:00'
}
const userData: any = []
for (let i = 0; i < 14; i++) {
  userData.push(mockUserData)
}
merge(mockUserResponse, nameObj)
mockFetchUserDetails.mockReturnValue(mockUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

storage.getItem = jest.fn()
storage.setItem = jest.fn()

describe('RegistrarHome tests', () => {
  const { store } = createStore()

  beforeAll(() => {
    getItem.mockReturnValue(registerScopeToken)
    store.dispatch(checkAuth({ '?token': registerScopeToken }))
  })

  it('sets loading state while waiting for data', () => {
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'review'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    // @ts-ignore
    expect(testComponent.component.containsMatchingElement(Spinner)).toBe(true)

    testComponent.component.unmount()
  })
  it('renders error text when an error occurs', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        error: new Error('boom')
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'review'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()

    expect(
      testComponent.component
        .find('#search-result-error-text-review')
        .children()
        .text()
    ).toBe('An error occurred while searching')

    testComponent.component.unmount()
  })

  it('renders page with three tabs', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        result: {
          data: {
            countEvents: {
              declared: 10,
              registered: 7,
              rejected: 5
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'review'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        draftCount={1}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(
      app
        .find('#tab_review')
        .hostNodes()
        .text()
    ).toContain('Ready for review (10)')
    app
      .find('#tab_progress')
      .hostNodes()
      .simulate('click')
    app
      .find('#tab_review')
      .hostNodes()
      .simulate('click')
    app
      .find('#tab_updates')
      .hostNodes()
      .simulate('click')
    app
      .find('#tab_print')
      .hostNodes()
      .simulate('click')
  })

  it('check drafts count', async () => {
    jest.clearAllMocks()
    const draft = createApplication(Event.BIRTH)
    store.dispatch(storeApplication(draft))

    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        result: {
          data: {
            countEvents: {
              declared: 10,
              registered: 7,
              rejected: 5
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'progress'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(
      app
        .find('#tab_progress')
        .hostNodes()
        .text()
    ).toContain('In progress (1)')
  })
  it('check rejected applications count', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        result: {
          data: {
            countEvents: {
              declared: 10,
              registered: 7,
              rejected: 5
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'updates'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        draftCount={1}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(
      app
        .find('#tab_updates')
        .hostNodes()
        .text()
    ).toContain('Sent for updates (5)')
  })
  it('check ready to print applications count', async () => {
    const graphqlMock = [
      {
        request: {
          query: COUNT_REGISTRATION_QUERY,
          variables: {
            locationIds: ['123456789']
          }
        },
        result: {
          data: {
            countEvents: {
              declared: 10,
              registered: 7,
              rejected: 5
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'print'
          },
          isExact: true,
          path: '',
          url: ''
        }}
        draftCount={1}
      />,
      store,
      graphqlMock
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const app = testComponent.component
    expect(
      app
        .find('#tab_print')
        .hostNodes()
        .text()
    ).toContain('Ready to print (7)')
  })
  it('renders all items returned from graphql query in ready for reivew', async () => {
    const TIME_STAMP = '1544188309380'
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.DECLARED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'DECLARED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: TIME_STAMP,
                    modifiedAt: TIME_STAMP
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'DECLARED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    contactNumber: null,
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: TIME_STAMP,
                    modifiedAt: TIME_STAMP
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    const EXPECTED_DATE_OF_APPLICATION = moment(
      moment(TIME_STAMP, 'x').format('YYYY-MM-DD HH:mm:ss'),
      'YYYY-MM-DD HH:mm:ss'
    ).fromNow()

    expect(data.length).toBe(2)
    expect(data[0].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[0].eventTimeElapsed).toBe('8 years ago')
    expect(data[0].applicationTimeElapsed).toBe(EXPECTED_DATE_OF_APPLICATION)
    expect(data[0].trackingId).toBe('BW0UTHR')
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()

    testComponent.component.unmount()
  })
  it('renders all items returned from graphql query in rejected tab', async () => {
    const TIME_STAMP = '1544188309380'
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'REJECTED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: null,
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: '2018-05-23T14:44:58+02:00',
                    modifiedAt: '2018-05-23T14:44:58+02:00'
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'REJECTED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: null,
                    contactNumber: '01622688231',
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: TIME_STAMP,
                    modifiedAt: TIME_STAMP
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'updates' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    const EXPECTED_DATE_OF_REJECTION = moment(
      moment(TIME_STAMP, 'x').format('YYYY-MM-DD HH:mm:ss'),
      'YYYY-MM-DD HH:mm:ss'
    ).fromNow()

    expect(data.length).toBe(2)
    expect(data[1].id).toBe('bc09200d-0160-43b4-9e2b-5b9e90424e95')
    expect(data[1].contactNumber).toBe('01622688231')
    expect(data[1].dateOfRejection).toBe(EXPECTED_DATE_OF_REJECTION)
    expect(data[1].event).toBe('Death')
    expect(data[1].actions).toBeDefined()

    testComponent.component.unmount()
  })
  it('renders all items returned from graphql query in inProgress tab', async () => {
    const TIME_STAMP = '2018-12-07T13:11:49.380Z'
    const drafts = [
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        event: 'birth',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          child: {
            familyNameEng: 'Anik',
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        event: 'death',
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          deceased: {
            familyNameEng: 'Anik',
            familyName: 'অনিক'
          }
        }
      }
    ]
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'progress' } }} />,
      store
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))
    // @ts-ignore
    testComponent.store.dispatch(storeApplication(drafts))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    const EXPECTED_DATE_OF_REJECTION = moment(
      TIME_STAMP,
      'YYYY-MM-DD'
    ).fromNow()

    expect(data[1].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[1].name).toBe('Anik')
    expect(data[1].dateOfModification).toBe(EXPECTED_DATE_OF_REJECTION)
    expect(data[1].event).toBe('Birth')
    expect(data[1].actions).toBeDefined()

    testComponent.component.unmount()
  })
  it('renders all items returned from graphql query in ready for print', async () => {
    const TIME_STAMP = '1544188309380'
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.REGISTERED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 2,
              results: [
                {
                  id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
                  type: 'Birth',
                  registration: {
                    status: 'REGISTERED',
                    contactNumber: '01622688231',
                    trackingId: 'BW0UTHR',
                    registrationNumber: '2019333494BBONT7U7',
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    duplicates: null,
                    createdAt: TIME_STAMP,
                    modifiedAt: TIME_STAMP
                  },
                  dateOfBirth: '2010-10-10',
                  childName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ],
                  dateOfDeath: null,
                  deceasedName: null
                },
                {
                  id: 'bc09200d-0160-43b4-9e2b-5b9e90424e95',
                  type: 'Death',
                  registration: {
                    status: 'REGISTERED',
                    trackingId: 'DW0UTHR',
                    registrationNumber: '2019333494B8I0NEB9',
                    contactNumber: '01622688231',
                    duplicates: ['308c35b4-04f8-4664-83f5-9790e790cd33'],
                    registeredLocationId:
                      '308c35b4-04f8-4664-83f5-9790e790cde1',
                    createdAt: TIME_STAMP,
                    modifiedAt: null
                  },
                  dateOfBirth: null,
                  childName: null,
                  dateOfDeath: '2007-01-01',
                  deceasedName: [
                    {
                      firstNames: 'Iliyas',
                      familyName: 'Khan',
                      use: 'en'
                    },
                    {
                      firstNames: 'ইলিয়াস',
                      familyName: 'খান',
                      use: 'bn'
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'print' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    testComponent.component.update()
    const data = testComponent.component.find(GridTable).prop('content')
    const EXPECTED_DATE_OF_APPLICATION = moment(
      moment(TIME_STAMP, 'x').format('YYYY-MM-DD HH:mm:ss'),
      'YYYY-MM-DD HH:mm:ss'
    ).fromNow()

    expect(data.length).toBe(2)
    expect(data[0].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[0].dateOfRegistration).toBe(EXPECTED_DATE_OF_APPLICATION)
    expect(data[0].trackingId).toBe('BW0UTHR')
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()

    testComponent.component.unmount()
  })

  it('should show pagination bar if items more than 11 in ReviewTab', async () => {
    Date.now = jest.fn(() => 1554055200000)
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.DECLARED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 14,
              results: userData
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'review' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(
      testComponent.component.find('#pagination').hostNodes()
    ).toHaveLength(1)

    testComponent.component
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')
    testComponent.component.unmount()
  })

  it('should show pagination bar in Review  if items more than 11', async () => {
    const graphqlMock = [
      {
        request: {
          query: SEARCH_EVENTS,
          variables: {
            status: EVENT_STATUS.REJECTED,
            locationIds: ['123456789'],
            count: 10,
            skip: 0
          }
        },
        result: {
          data: {
            searchEvents: {
              totalItems: 14,
              results: userData
            }
          }
        }
      }
    ]

    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome match={{ params: { tabId: 'updates' } }} />,
      store,
      graphqlMock
    )

    getItem.mockReturnValue(registerScopeToken)
    testComponent.store.dispatch(checkAuth({ '?token': registerScopeToken }))
    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(
      testComponent.component.find('#pagination').hostNodes()
    ).toHaveLength(1)

    testComponent.component
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')

    testComponent.component.unmount()
  })

  it('Should render pagination in progress tab if data is more than 10', async () => {
    jest.clearAllMocks()
    for (let i = 0; i < 12; i++) {
      const draft = createReviewApplication(uuid(), {}, Event.BIRTH)
      store.dispatch(storeApplication(draft))
    }
    const testComponent = createTestComponent(
      // @ts-ignore
      <RegistrarHome
        match={{
          params: {
            tabId: 'progress'
          },
          isExact: true,
          path: '',
          url: ''
        }}
      />,
      store
    )

    // wait for mocked data to load mockedProvider
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    testComponent.component.update()
    const pagiBtn = testComponent.component.find('#pagination')

    expect(pagiBtn.hostNodes()).toHaveLength(1)
    testComponent.component
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')
    testComponent.component.unmount()
  })
})
