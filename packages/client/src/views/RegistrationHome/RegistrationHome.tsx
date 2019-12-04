/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  downloadApplication,
  filterProcessingApplicationsFromQuery,
  IApplication,
  IWorkqueue,
  makeApplicationReadyToDownload,
  SUBMISSION_STATUS
} from '@client/applications'
import { Header } from '@client/components/interface/Header/Header'
import { IViewHeadingProps } from '@client/components/ViewHeading'
import { Action, Event } from '@client/forms'
import { errorMessages } from '@client/i18n/messages'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import { messages } from '@client/i18n/messages/views/registrarHome'
import { syncRegistrarWorkqueue } from '@client/ListSyncController'
import {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  goToRegistrarHomeTab,
  goToReviewDuplicate,
  IDynamicValues
} from '@client/navigation'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
import { getUserLocation } from '@client/utils/userUtils'
import NotificationToast from '@client/views/RegistrationHome/NotificationToast'
import { RowHistoryView } from '@client/views/RegistrationHome/RowHistoryView'
import {
  Button,
  FloatingActionButton,
  IButtonProps,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  PlusTransparentWhite,
  StatusGray,
  StatusGreen,
  StatusOrange,
  StatusProgress,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  FloatingNotification,
  ISearchInputProps,
  NOTIFICATION_TYPE,
  Spinner,
  TopBar
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import ApolloClient from 'apollo-client'
import * as React from 'react'
import { withApollo } from 'react-apollo'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Dispatch } from 'redux'
import { ApprovalTab } from './tabs/approvals/approvalTab'
import { InProgressTab } from './tabs/inProgress/inProgressTab'
import { PrintTab } from './tabs/print/printTab'
import { RejectTab } from './tabs/reject/rejectTab'
import { ReviewTab } from './tabs/review/reviewTab'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}

export interface IQueryData {
  inProgressTab: GQLEventSearchResultSet
  notificationTab: GQLEventSearchResultSet
  reviewTab: GQLEventSearchResultSet
  rejectTab: GQLEventSearchResultSet
  approvalTab: GQLEventSearchResultSet
  printTab: GQLEventSearchResultSet
}

export const IconTab = styled(Button)<IProps>`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.subtitleStyle};
  padding-left: 0;
  padding-right: 0;
  border-radius: 0;
  flex-shrink: 0;
  outline: none;
  margin-left: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-left: 8px;
  }
  ${({ active }) =>
    active
      ? 'border-bottom: 3px solid #5E93ED'
      : 'border-bottom: 3px solid transparent'};
  & > div {
    padding: 0 8px;
  }
  :first-child > div {
    position: relative;
    padding-left: 0;
  }
  & div > div {
    margin-right: 8px;
  }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.focus};
    color: ${({ theme }) => theme.colors.copy};
  }
  &:not([data-focus-visible-added]) {
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.colors.copy};
  }
`
export const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
const FABContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

interface IBaseRegistrationHomeProps {
  theme: ITheme
  language: string
  scope: Scope | null
  goToPage: typeof goToPage
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
  goToReviewDuplicate: typeof goToReviewDuplicate
  goToPrintCertificate: typeof goToPrintCertificate
  downloadApplication: typeof downloadApplication
  registrarLocationId: string
  tabId: string
  selectorId: string
  drafts: IApplication[]
  applications: IApplication[]
  workqueue: IWorkqueue
  goToEvents: typeof goToEvents
  storedApplications: IApplication[]
  client: ApolloClient<{}>
  dispatch: Dispatch
  reviewStatuses: string[]
}

interface IRegistrationHomeState {
  progressCurrentPage: number
  reviewCurrentPage: number
  updatesCurrentPage: number
  approvalCurrentPage: number
  printCurrentPage: number
  showCertificateToast: boolean
}

type IRegistrationHomeProps = IntlShapeProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseRegistrationHomeProps

const TAB_ID = {
  inProgress: 'progress',
  readyForReview: 'review',
  sentForUpdates: 'updates',
  sentForApproval: 'approvals',
  readyForPrint: 'print'
}

export const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  VALIDATED: 'VALIDATED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED'
}
export class RegistrationHomeView extends React.Component<
  IRegistrationHomeProps,
  IRegistrationHomeState
> {
  pageSize = 10
  interval: any = undefined
  constructor(props: IRegistrationHomeProps) {
    super(props)
    this.state = {
      progressCurrentPage: 1,
      reviewCurrentPage: 1,
      updatesCurrentPage: 1,
      approvalCurrentPage: 1,
      printCurrentPage: 1,
      showCertificateToast: Boolean(
        this.props.applications.filter(
          item => item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY
        ).length
      )
    }
  }

  syncWorkqueue() {
    const {
      dispatch,
      workqueue,
      registrarLocationId,
      reviewStatuses,
      client
    } = this.props
    const {
      progressCurrentPage,
      reviewCurrentPage,
      updatesCurrentPage,
      approvalCurrentPage,
      printCurrentPage
    } = this.state
    syncRegistrarWorkqueue(
      dispatch,
      !workqueue.loading,
      registrarLocationId,
      reviewStatuses,
      client,
      (progressCurrentPage - 1) * 10,
      (reviewCurrentPage - 1) * 10,
      (updatesCurrentPage - 1) * 10,
      (approvalCurrentPage - 1) * 10,
      (printCurrentPage - 1) * 10
    )
  }

  componentDidMount() {
    this.syncWorkqueue()
    this.interval = setInterval(() => {
      this.syncWorkqueue()
    }, 300000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  componentDidUpdate(
    prevProps: IRegistrationHomeProps,
    prevState: IRegistrationHomeState
  ) {
    if (prevProps.tabId !== this.props.tabId) {
      this.syncWorkqueue()
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasValidateScope() {
    return this.props.scope && this.props.scope.includes('validate')
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  subtractApplicationsWithStatus(count: number, status: string[]) {
    const outboxCount = this.props.storedApplications.filter(
      app => app.submissionStatus && status.includes(app.submissionStatus)
    ).length
    return count - outboxCount
  }

  onPageChange = (newPageNumber: number) => {
    switch (this.props.tabId) {
      case TAB_ID.inProgress:
        this.setState({ progressCurrentPage: newPageNumber })
        break
      case TAB_ID.readyForReview:
        this.setState({ reviewCurrentPage: newPageNumber })
        break
      case TAB_ID.sentForUpdates:
        this.setState({ updatesCurrentPage: newPageNumber })
        break
      case TAB_ID.sentForApproval:
        this.setState({ approvalCurrentPage: newPageNumber })
        break
      case TAB_ID.readyForPrint:
        this.setState({ printCurrentPage: newPageNumber })
        break
      default:
        throw new Error(`Unknown tab id when changing page ${this.props.tabId}`)
    }
  }

  downloadApplication = (
    event: string,
    compositionId: string,
    action: Action
  ) => {
    const downloadableApplication = makeApplicationReadyToDownload(
      event.toLowerCase() as Event,
      compositionId,
      action
    )
    this.props.downloadApplication(downloadableApplication, this.props.client)
  }

  getData = (
    progressCurrentPage: number,
    reviewCurrentPage: number,
    updatesCurrentPage: number,
    approvalCurrentPage: number,
    printCurrentPage: number
  ) => {
    const {
      workqueue,
      theme,
      intl,
      tabId,
      drafts,
      selectorId,
      registrarLocationId,
      storedApplications
    } = this.props
    const { loading, error, data } = workqueue
    if (loading || !data) {
      return (
        <StyledSpinner
          id="search-result-spinner"
          baseColor={theme.colors.background}
        />
      )
    }
    if (!data || error) {
      return (
        <ErrorText id="search-result-error-text-count">
          {intl.formatMessage(errorMessages.queryError)}
        </ErrorText>
      )
    }

    const filteredData = filterProcessingApplicationsFromQuery(
      data,
      storedApplications
    )

    return (
      <>
        <TopBar>
          <IconTab
            id={`tab_${TAB_ID.inProgress}`}
            key={TAB_ID.inProgress}
            active={tabId === TAB_ID.inProgress}
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <StatusProgress />}
            onClick={() => this.props.goToRegistrarHomeTab(TAB_ID.inProgress)}
          >
            {intl.formatMessage(messages.inProgress)} (
            {drafts.filter(
              draft =>
                draft.submissionStatus ===
                SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
            ).length +
              (filteredData.inProgressTab.totalItems || 0) +
              (filteredData.notificationTab.totalItems || 0)}
            )
          </IconTab>
          <IconTab
            id={`tab_${TAB_ID.readyForReview}`}
            key={TAB_ID.readyForReview}
            active={tabId === TAB_ID.readyForReview}
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <StatusOrange />}
            onClick={() =>
              this.props.goToRegistrarHomeTab(TAB_ID.readyForReview)
            }
          >
            {intl.formatMessage(messages.readyForReview)} (
            {filteredData.reviewTab.totalItems})
          </IconTab>
          <IconTab
            id={`tab_${TAB_ID.sentForUpdates}`}
            key={TAB_ID.sentForUpdates}
            active={tabId === TAB_ID.sentForUpdates}
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <StatusRejected />}
            onClick={() =>
              this.props.goToRegistrarHomeTab(TAB_ID.sentForUpdates)
            }
          >
            {intl.formatMessage(messages.sentForUpdates)} (
            {filteredData.rejectTab.totalItems})
          </IconTab>
          {this.userHasValidateScope() && (
            <IconTab
              id={`tab_${TAB_ID.sentForApproval}`}
              key={TAB_ID.sentForApproval}
              active={tabId === TAB_ID.sentForApproval}
              align={ICON_ALIGNMENT.LEFT}
              icon={() => <StatusGray />}
              onClick={() =>
                this.props.goToRegistrarHomeTab(TAB_ID.sentForApproval)
              }
            >
              {intl.formatMessage(messages.sentForApprovals)} (
              {filteredData.approvalTab.totalItems})
            </IconTab>
          )}
          <IconTab
            id={`tab_${TAB_ID.readyForPrint}`}
            key={TAB_ID.readyForPrint}
            active={tabId === TAB_ID.readyForPrint}
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <StatusGreen />}
            onClick={() =>
              this.props.goToRegistrarHomeTab(TAB_ID.readyForPrint)
            }
          >
            {intl.formatMessage(messages.readyToPrint)} (
            {filteredData.printTab.totalItems})
          </IconTab>
        </TopBar>
        {tabId === TAB_ID.inProgress && (
          <InProgressTab
            drafts={drafts}
            selectorId={selectorId}
            registrarLocationId={registrarLocationId}
            queryData={{
              inProgressData: filteredData.inProgressTab,
              notificationData: filteredData.notificationTab
            }}
            page={progressCurrentPage}
            onPageChange={this.onPageChange}
            onDownloadApplication={this.downloadApplication}
          />
        )}
        {tabId === TAB_ID.readyForReview && (
          <ReviewTab
            registrarLocationId={registrarLocationId}
            queryData={{
              data: filteredData.reviewTab
            }}
            page={reviewCurrentPage}
            onPageChange={this.onPageChange}
            onDownloadApplication={this.downloadApplication}
          />
        )}
        {tabId === TAB_ID.sentForUpdates && (
          <RejectTab
            registrarLocationId={registrarLocationId}
            queryData={{
              data: filteredData.rejectTab
            }}
            page={updatesCurrentPage}
            onPageChange={this.onPageChange}
            onDownloadApplication={this.downloadApplication}
          />
        )}
        {tabId === TAB_ID.sentForApproval && (
          <ApprovalTab
            registrarLocationId={registrarLocationId}
            queryData={{
              data: filteredData.approvalTab
            }}
            page={approvalCurrentPage}
            onPageChange={this.onPageChange}
          />
        )}
        {tabId === TAB_ID.readyForPrint && (
          <PrintTab
            registrarLocationId={registrarLocationId}
            queryData={{
              data: filteredData.printTab
            }}
            page={printCurrentPage}
            onPageChange={this.onPageChange}
            onDownloadApplication={this.downloadApplication}
          />
        )}
      </>
    )
  }

  render() {
    const { intl } = this.props
    const {
      progressCurrentPage,
      reviewCurrentPage,
      updatesCurrentPage,
      approvalCurrentPage,
      printCurrentPage
    } = this.state

    return (
      <>
        <Header />

        {this.getData(
          progressCurrentPage,
          reviewCurrentPage,
          updatesCurrentPage,
          approvalCurrentPage,
          printCurrentPage
        )}

        <FABContainer>
          <FloatingActionButton
            id="new_event_declaration"
            onClick={this.props.goToEvents}
            icon={() => <PlusTransparentWhite />}
          />
        </FABContainer>
        <NotificationToast />

        {this.state.showCertificateToast && (
          <FloatingNotification
            type={NOTIFICATION_TYPE.SUCCESS}
            show={this.state.showCertificateToast}
            callback={() => {
              this.setState({ showCertificateToast: false })
            }}
          >
            {intl.formatHTMLMessage(certificateMessage.toastMessage)}
          </FloatingNotification>
        )}
      </>
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; selectorId?: string }>
) {
  const { match } = props
  const userDetails = getUserDetails(state)
  const registrarLocationId =
    (userDetails && getUserLocation(userDetails).id) || ''
  const scope = getScope(state)
  const reviewStatuses =
    scope && scope.includes('register')
      ? [EVENT_STATUS.DECLARED, EVENT_STATUS.VALIDATED]
      : [EVENT_STATUS.DECLARED]

  return {
    applications: state.applicationsState.applications,
    workqueue: state.workqueueState.workqueue,
    language: state.i18n.language,
    scope,
    registrarLocationId,
    reviewStatuses,
    tabId: (match && match.params && match.params.tabId) || 'review',
    selectorId: (match && match.params && match.params.selectorId) || '',
    storedApplications: state.applicationsState.applications,
    drafts:
      (state.applicationsState.applications &&
        state.applicationsState.applications.filter(
          (application: IApplication) =>
            application.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )) ||
      []
  }
}

export const RegistrationHome = connect(
  mapStateToProps,
  (dispatch: Dispatch) => ({
    dispatch,
    goToEvents: () => dispatch(goToEvents()),
    goToPage: (
      pageRoute: string,
      applicationId: string,
      pageId: string,
      event: string,
      fieldNameHash?: string,
      historyState?: IDynamicValues
    ) =>
      dispatch(
        goToPage(
          pageRoute,
          applicationId,
          pageId,
          event,
          fieldNameHash,
          historyState
        )
      ),
    goToRegistrarHomeTab: (tabId: string, selectorId?: string) =>
      dispatch(goToRegistrarHomeTab(tabId, selectorId)),
    goToReviewDuplicate: (applicationId: string) =>
      dispatch(goToReviewDuplicate(applicationId)),
    goToPrintCertificate: (
      registrationId: string,
      event: string,
      groupId?: string
    ) => dispatch(goToPrintCertificate(registrationId, event, groupId)),
    downloadApplication: (
      application: IApplication,
      client: ApolloClient<{}>
    ) => dispatch(downloadApplication(application, client))
  })
)(injectIntl(withTheme(withApollo(RegistrationHomeView))))
