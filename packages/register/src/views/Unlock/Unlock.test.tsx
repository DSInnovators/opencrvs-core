import * as React from 'react'
import { ReactWrapper } from 'enzyme'
import { createTestComponent } from 'src/tests/util'
import { createStore } from 'src/store'
import { Unlock } from './Unlock'
import { storage } from 'src/storage'

const clearPassword = (component: ReactWrapper) => {
  const backSpaceElem = component.find('#keypad-backspace').hostNodes()
  backSpaceElem.simulate('click')
  backSpaceElem.simulate('click')
  backSpaceElem.simulate('click')
  backSpaceElem.simulate('click')
  backSpaceElem.update()
}

describe('Unlock page loads Properly', () => {
  // mock indexeddb
  const indexedDB = {
    USER_DETAILS: JSON.stringify({ userMgntUserID: 'shakib75' }),
    USER_DATA: JSON.stringify([
      {
        userID: 'shakib75',
        userPIN: '$2a$10$xQBLcbPgGQNu9p6zVchWuu6pmCrQIjcb6k2W1PIVUxVTE/PumWM82',
        drafts: []
      }
    ]),
    screenLock: undefined,
    USER_ID: 'shakib75',
    locked_time: undefined
  }

  storage.getItem = jest.fn(async (key: string) =>
    Promise.resolve(indexedDB[key])
  )

  storage.setItem = jest.fn(
    async (key: string, value: string) => (indexedDB[key] = value)
  )

  const { store } = createStore()
  const testComponent = createTestComponent(
    <Unlock onCorrectPinMatch={() => null} />,
    store
  )

  it('Should load the Unlock page properly', () => {
    const elem = testComponent.component.find('#unlockPage').hostNodes().length
    expect(elem).toBe(1)
  })

  it('There should be no error message after providing successfull Pin', () => {
    clearPassword(testComponent.component)
    const numberElem = testComponent.component.find('#keypad-0').hostNodes()

    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    testComponent.component.update()

    const errorElem = testComponent.component.find('#errorMsg').hostNodes()
      .length
    expect(errorElem).toBe(0)
  })

  it('Should Display Incorrect error message', async () => {
    clearPassword(testComponent.component)
    const numberElem = testComponent.component.find('#keypad-1').hostNodes()
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Incorrect pin. Please try again')
    }, 100)
  })

  it('Should display the Last try message', async () => {
    const numberElem = testComponent.component.find('#keypad-1').hostNodes()
    clearPassword(testComponent.component)
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    testComponent.component.update()

    clearPassword(testComponent.component)
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Last Try')
    }, 100)
  })

  it('Should display Locked Message', async () => {
    clearPassword(testComponent.component)
    const numberElem = testComponent.component.find('#keypad-1').hostNodes()
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Locked')
    }, 1000)
  })

  it('Should display Locked Message', async () => {
    clearPassword(testComponent.component)
    const numberElem = testComponent.component.find('#keypad-1').hostNodes()
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    numberElem.simulate('click')
    testComponent.component.update()

    setTimeout(() => {
      const errorElem = testComponent.component
        .find('#errorMsg')
        .hostNodes()
        .text()
      expect(errorElem).toBe('Locked')
    }, 1000)
  })
})

describe('Logout Sequence', async () => {
  const { store } = createStore()
  const redirect = jest.fn()
  const testComponent = createTestComponent(
    <Unlock onCorrectPinMatch={() => redirect} />,
    store
  )

  it('Should Pop the Logout modal', () => {
    testComponent.component
      .find('#logout')
      .hostNodes()
      .simulate('click')
    testComponent.component.update()
    const modalIsDisplayed = testComponent.component
      .find('#logout_confirm')
      .hostNodes().length
    expect(modalIsDisplayed).toBe(1)
  })
})
