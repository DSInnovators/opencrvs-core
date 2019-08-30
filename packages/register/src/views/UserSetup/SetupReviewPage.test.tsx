import * as React from 'react'
import { createTestComponent, userDetails } from '@register/tests/util'
import { getStorageUserDetailsSuccess } from '@opencrvs/register/src/profile/profileActions'
import { createStore } from '@register/store'
import { UserSetupReview } from './SetupReviewPage'
import { activateUserMutation } from './queries'

const { store } = createStore()

describe('SetupReviewPage page tests', () => {
  beforeEach(async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
  })
  it('render page', async () => {
    store.dispatch(
      getStorageUserDetailsSuccess(
        JSON.stringify({ ...userDetails, type: 'CHA' })
      )
    )
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
        goToStep={() => {}}
      />,
      store
    )

    expect(testComponent.component.find('#UserSetupData')).toBeDefined()
    testComponent.component.unmount()
  })
  it('render page without type', async () => {
    store.dispatch(getStorageUserDetailsSuccess(JSON.stringify(userDetails)))
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
        goToStep={() => {}}
      />,
      store
    )

    const role = testComponent.component
      .find('#RoleType')
      .hostNodes()
      .childAt(0)
      .childAt(0)
      .childAt(1)
      .text()
    expect(role).toEqual('Field Agent')
    testComponent.component.unmount()
  })
  it('clicks question to change', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
        goToStep={() => {}}
      />,
      store
    )

    testComponent.component
      .find('#Question_Action_BIRTH_TOWN')
      .hostNodes()
      .simulate('click')

    testComponent.component.unmount()
  })
  it('submit user setup for activation', async () => {
    const mock = [
      {
        request: {
          query: activateUserMutation,
          variables: {
            userId: 'ba7022f0ff4822',
            password: 'password',
            securityQuestionAnswers: [
              { questionKey: 'BIRTH_TOWN', answer: 'test' }
            ]
          }
        },
        result: {
          data: []
        }
      }
    ]
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
      />,
      store,
      mock
    )

    testComponent.component.find('button#Confirm').simulate('click')

    testComponent.component.unmount()
  })

  it('it shows error if error occurs', async () => {
    const graphqlErrorMock = [
      {
        request: {
          query: activateUserMutation,
          variables: {
            userId: 'ba7022f0ff4822',
            password: 'password',
            securityQuestionAnswers: [
              { questionKey: 'BIRTH_TOWN', answer: 'test' }
            ]
          }
        },
        error: new Error('boom!')
      }
    ]

    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
      />,
      store,
      graphqlErrorMock
    )

    testComponent.component.find('button#Confirm').simulate('click')

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()
    expect(
      testComponent.component
        .find('#GlobalError')
        .hostNodes()
        .text()
    ).toBe('An error occured. Please try again.')

    testComponent.component.unmount()
  })

  it('shows nothing for undefined fields of userDetails', async () => {
    store.dispatch(
      getStorageUserDetailsSuccess(
        JSON.stringify({
          catchmentArea: [
            {
              id: '850f50f3-2ed4-4ae6-b427-2d894d4a3329',
              name: 'Dhaka',
              status: 'active',
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                  value: '3'
                },
                {
                  system: 'http://opencrvs.org/specs/id/bbs-code',
                  value: '30'
                },
                {
                  system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                  value: 'DIVISION'
                }
              ]
            }
          ]
        })
      )
    )

    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserSetupReview
        setupData={{
          userId: 'ba7022f0ff4822',
          password: 'password',
          securityQuestionAnswers: [
            { questionKey: 'BIRTH_TOWN', answer: 'test' }
          ]
        }}
      />,
      store
    )

    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })
    testComponent.component.update()

    expect(
      testComponent.component
        .find('div#BengaliName')
        .hostNodes()
        .text()
    ).toBe('Bengali nameChange')
    expect(
      testComponent.component
        .find('div#EnglishName')
        .hostNodes()
        .text()
    ).toBe('English nameChange')
    expect(
      testComponent.component
        .find('div#UserPhone')
        .hostNodes()
        .text()
    ).toBe('Phone numberChange')

    testComponent.component.unmount()
  })
})
