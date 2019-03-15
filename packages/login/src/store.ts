/* istanbul ignore next */
import {
  compose,
  createStore as createReduxStore,
  applyMiddleware,
  AnyAction,
  Store,
  StoreEnhancer
} from 'redux'
import { createBrowserHistory } from 'history'
import {
  combineReducers,
  install,
  StoreCreator,
  getModel,
  LoopReducer
} from 'redux-loop'
import {
  routerReducer,
  routerMiddleware,
  RouterState
} from 'react-router-redux'
import { reducer as formReducer, FormStateMap, FormAction } from 'redux-form'
import { loginReducer, LoginState } from './login/reducer'
import { intlReducer, IntlState } from './i18n/reducer'
import * as Sentry from '@sentry/browser'
import * as createSentryMiddleware from 'redux-sentry-middleware'

export const history = createBrowserHistory()

export interface IStoreState {
  login: LoginState
  router: RouterState
  form: FormStateMap
  i18n: IntlState
}

const formRed: LoopReducer<FormStateMap, FormAction> = (
  state: FormStateMap,
  action: FormAction
) => formReducer(state, action)

const reducers = combineReducers<IStoreState>({
  login: loginReducer,
  router: routerReducer,
  form: formRed,
  i18n: intlReducer
})

const enhancedCreateStore = createReduxStore as StoreCreator

const enhancer = compose(
  install(),
  applyMiddleware(routerMiddleware(history)),
  // @ts-ignore types are not correct for this module yet
  applyMiddleware(createSentryMiddleware(Sentry)),
  // tslint:disable no-any
  typeof (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    : (f: any) => f
  // tslint:enable no-any
) as StoreEnhancer<IStoreState>

export type AppStore = Store<IStoreState, AnyAction>

export const createStore = (): AppStore =>
  enhancedCreateStore<IStoreState, AnyAction>(
    reducers,
    getModel(reducers(undefined, { type: 'NOOP' })),
    enhancer
  )
