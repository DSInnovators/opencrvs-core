import * as React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'
import { resolve } from 'url'
import { History } from 'history'
import { Switch } from 'react-router'
import { ThemeProvider } from 'styled-components'
import { I18nContainer } from './i18n/components/I18nContainer'

import { getTheme } from '@opencrvs/components/lib/theme'

import { createStore, AppStore } from './store'
import { config } from './config'
import { ProtectedRoute } from './components/ProtectedRoute'
import * as routes from './navigation/routes'

import { NotificationComponent } from './components/Notification'
import { Page } from './components/Page'

import { SelectVitalEvent } from './views/SelectVitalEvent/SelectVitalEvent'
import { SelectInformant } from './views/SelectInformant/SelectInformant'

import { RegisterForm } from './views/RegisterForm/RegisterForm'
import { SavedRegistration } from './views/SavedRegistration/SavedRegistration'
import ScrollToTop from 'src/components/ScrollToTop'
import { Home } from 'src/views/Home/Home'

const client = new ApolloClient({
  uri: resolve(config.API_GATEWAY_URL, 'graphql')
})

interface IAppProps {
  client?: ApolloClient<{}>
  store: AppStore
  history: History
}

export const store = createStore()

export class App extends React.Component<IAppProps, {}> {
  public render() {
    return (
      <ApolloProvider client={this.props.client || client}>
        <Provider store={this.props.store}>
          <I18nContainer>
            <ThemeProvider theme={getTheme(config.COUNTRY)}>
              <ConnectedRouter history={this.props.history}>
                <ScrollToTop>
                  <NotificationComponent>
                    <Page>
                      <Switch>
                        <ProtectedRoute
                          exact
                          path={routes.HOME}
                          component={Home}
                        />
                        <ProtectedRoute
                          exact
                          path={routes.SELECT_VITAL_EVENT}
                          component={SelectVitalEvent}
                        />
                        <ProtectedRoute
                          exact
                          path={routes.SELECT_INFORMANT}
                          component={SelectInformant}
                        />
                        <ProtectedRoute
                          exact
                          path={routes.DRAFT_BIRTH_PARENT_FORM}
                          component={RegisterForm}
                        />
                        <ProtectedRoute
                          path={routes.DRAFT_BIRTH_PARENT_FORM_TAB}
                          component={RegisterForm}
                        />
                        <ProtectedRoute
                          path={routes.SAVED_REGISTRATION}
                          component={SavedRegistration}
                        />
                      </Switch>
                    </Page>
                  </NotificationComponent>
                </ScrollToTop>
              </ConnectedRouter>
            </ThemeProvider>
          </I18nContainer>
        </Provider>
      </ApolloProvider>
    )
  }
}
