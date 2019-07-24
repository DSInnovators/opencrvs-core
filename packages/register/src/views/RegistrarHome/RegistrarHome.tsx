import {
  Button,
  FloatingActionButton,
  IButtonProps,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  Duplicate,
  PlusTransparentWhite,
  StatusGreen,
  StatusOrange,
  StatusProgress,
  StatusRejected
} from '@opencrvs/components/lib/icons'
import {
  ISearchInputProps,
  Spinner,
  TopBar
} from '@opencrvs/components/lib/interface'
import { IApplication, SUBMISSION_STATUS } from '@register/applications'
import { Header } from '@register/components/interface/Header/Header'
import { IViewHeadingProps } from '@register/components/ViewHeading'
import {
  goToEvents as goToEventsAction,
  goToPage as goToPageAction,
  goToPrintCertificate as goToPrintCertificateAction,
  goToRegistrarHomeTab as goToRegistrarHomeTabAction,
  goToReviewDuplicate as goToReviewDuplicateAction
} from '@register/navigation'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE
} from '@register/navigation/routes'
import { getScope, getUserDetails } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import styled, { ITheme, withTheme } from '@register/styledComponents'
import { Scope } from '@register/utils/authUtils'
import { sentenceCase } from '@register/utils/data-formatting'
import { getUserLocation, IUserDetails } from '@register/utils/userUtils'
import NotificationToast from '@register/views/RegistrarHome/NotificatoinToast'
import {
  COUNT_EVENT_REGISTRATION_BY_STATUS,
  COUNT_REGISTRATION_QUERY
} from '@register/views/RegistrarHome/queries'
import { RowHistoryView } from '@register/views/RegistrarHome/RowHistoryView'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { messages } from './messages'
import { InProgressTab } from './tabs/inProgress/inProgressTab'
import { PrintTab } from './tabs/print/printTab'
import { RejectTab } from './tabs/reject/rejectTab'
import { ReviewTab } from './tabs/review/reviewTab'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}

export const IconTab = styled(Button).attrs<IProps>({})`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.subtitleStyle};
  padding-left: 0;
  padding-right: 0;
  border-radius: 0;
  flex-shrink: 0;
  outline: none;
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
  & > div {
    padding: 0 16px;
  }
  :first-child > div {
    position: relative;
    padding-left: 0;
  }
  & div > div {
    margin-right: 8px;
  }
  &:focus {
    outline: 0;
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

interface IBaseRegistrarHomeProps {
  theme: ITheme
  language: string
  scope: Scope | null
  userDetails: IUserDetails | null
  goToPage: typeof goToPageAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTabAction
  goToReviewDuplicate: typeof goToReviewDuplicateAction
  goToPrintCertificate: typeof goToPrintCertificateAction
  tabId: string
  selectorId: string
  drafts: IApplication[]
  goToEvents: typeof goToEventsAction
}

interface IRegistrarHomeState {
  reviewCurrentPage: number
  updatesCurrentPage: number
}

type IRegistrarHomeProps = InjectedIntlProps &
  IViewHeadingProps &
  ISearchInputProps &
  IBaseRegistrarHomeProps

const TAB_ID = {
  inProgress: 'progress',
  readyForReview: 'review',
  sentForUpdates: 'updates',
  readyForPrint: 'print'
}

export const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED'
}
export class RegistrarHomeView extends React.Component<
  IRegistrarHomeProps,
  IRegistrarHomeState
> {
  pageSize = 10
  constructor(props: IRegistrarHomeProps) {
    super(props)
    this.state = {
      reviewCurrentPage: 1,
      updatesCurrentPage: 1
    }
  }
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  transformDraftContent = () => {
    if (!this.props.drafts || this.props.drafts.length <= 0) {
      return []
    }
    return this.props.drafts
      .filter(
        draft =>
          draft.submissionStatus === SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
      )
      .map((draft: IApplication) => {
        let name
        let pageRoute: string
        if (draft.event && draft.event.toString() === 'birth') {
          name =
            (draft.data &&
              draft.data.child &&
              draft.data.child.familyNameEng &&
              (!draft.data.child.firstNamesEng
                ? ''
                : draft.data.child.firstNamesEng + ' ') +
                draft.data.child.familyNameEng) ||
            (draft.data &&
              draft.data.child &&
              draft.data.child.familyName &&
              (!draft.data.child.firstNames
                ? ''
                : draft.data.child.firstNames + ' ') +
                draft.data.child.familyName) ||
            ''
          pageRoute = DRAFT_BIRTH_PARENT_FORM_PAGE
        } else if (draft.event && draft.event.toString() === 'death') {
          name =
            (draft.data &&
              draft.data.deceased &&
              draft.data.deceased.familyNameEng &&
              (!draft.data.deceased.firstNamesEng
                ? ''
                : draft.data.deceased.firstNamesEng + ' ') +
                draft.data.deceased.familyNameEng) ||
            (draft.data &&
              draft.data.deceased &&
              draft.data.deceased.familyName &&
              (!draft.data.deceased.firstNames
                ? ''
                : draft.data.deceased.firstNames + ' ') +
                draft.data.deceased.familyName) ||
            ''
          pageRoute = DRAFT_DEATH_FORM_PAGE
        }
        const lastModificationDate = draft.modifiedOn || draft.savedOn
        const actions = [
          {
            label: this.props.intl.formatMessage(messages.update),
            handler: () =>
              this.props.goToPage(
                pageRoute,
                draft.id,
                'preview',
                (draft.event && draft.event.toString()) || ''
              )
          }
        ]
        return {
          id: draft.id,
          event: (draft.event && sentenceCase(draft.event)) || '',
          name: name || '',
          dateOfModification:
            (lastModificationDate && moment(lastModificationDate).fromNow()) ||
            '',
          actions
        }
      })
  }

  renderInProgressTabWithCount = (
    tabId: string,
    drafts: IApplication[],
    registrarUnion: string
  ) => {
    const { intl } = this.props

    return (
      <Query
        query={COUNT_EVENT_REGISTRATION_BY_STATUS}
        variables={{
          locationIds: [registrarUnion],
          status: EVENT_STATUS.IN_PROGRESS
        }}
      >
        {({
          loading,
          error,
          data
        }: {
          loading: any
          error?: any
          data: any
        }) => {
          if (error) {
            Sentry.captureException(error)
            return (
              <ErrorText id="search-result-error-text-count">
                {intl.formatMessage(messages.queryError)}
              </ErrorText>
            )
          }

          return (
            <IconTab
              id={`tab_${TAB_ID.inProgress}`}
              key={TAB_ID.inProgress}
              active={tabId === TAB_ID.inProgress}
              align={ICON_ALIGNMENT.LEFT}
              icon={() => <StatusProgress />}
              onClick={() => this.props.goToRegistrarHomeTab(TAB_ID.inProgress)}
            >
              {intl.formatMessage(messages.inProgress)} (
              {(drafts &&
                drafts.filter(
                  draft =>
                    draft.submissionStatus ===
                    SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
                ).length +
                  ((data &&
                    data.countEventRegistrationsByStatus &&
                    data.countEventRegistrationsByStatus.count) ||
                    0)) ||
                0}
              )
            </IconTab>
          )
        }}
      </Query>
    )
  }

  onPageChange = (newPageNumber: number) => {
    if (this.props.tabId === TAB_ID.readyForReview) {
      this.setState({ reviewCurrentPage: newPageNumber })
    }
    if (this.props.tabId === TAB_ID.sentForUpdates) {
      this.setState({ updatesCurrentPage: newPageNumber })
    }
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  render() {
    const { theme, intl, userDetails, tabId, selectorId, drafts } = this.props
    const registrarUnion = userDetails && getUserLocation(userDetails, 'UNION')
    let parentQueryLoading = false

    return (
      <>
        <Header />
        <Query
          query={COUNT_REGISTRATION_QUERY}
          variables={{
            locationIds: [registrarUnion]
          }}
        >
          {({
            loading,
            error,
            data
          }: {
            loading: any
            error?: any
            data: any
          }) => {
            if (loading) {
              parentQueryLoading = true
              return (
                <StyledSpinner
                  id="search-result-spinner"
                  baseColor={theme.colors.background}
                />
              )
            }
            parentQueryLoading = false
            if (error) {
              Sentry.captureException(error)
              return (
                <ErrorText id="search-result-error-text-count">
                  {intl.formatMessage(messages.queryError)}
                </ErrorText>
              )
            }

            return (
              <>
                <TopBar>
                  {this.renderInProgressTabWithCount(
                    tabId,
                    drafts,
                    registrarUnion as string
                  )}
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
                    {data.countEvents.declared})
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
                    {data.countEvents.rejected})
                  </IconTab>
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
                    {data.countEvents.registered})
                  </IconTab>
                </TopBar>
              </>
            )
          }}
        </Query>
        {tabId === TAB_ID.inProgress && (
          <InProgressTab
            drafts={drafts}
            selectorId={selectorId}
            registrarUnion={registrarUnion}
            parentQueryLoading={parentQueryLoading}
          />
        )}
        {tabId === TAB_ID.readyForReview && (
          <ReviewTab
            registrarUnion={registrarUnion}
            parentQueryLoading={parentQueryLoading}
          />
        )}
        {tabId === TAB_ID.sentForUpdates && (
          <RejectTab
            registrarUnion={registrarUnion}
            parentQueryLoading={parentQueryLoading}
          />
        )}
        {tabId === TAB_ID.readyForPrint && (
          <PrintTab
            registrarUnion={registrarUnion}
            parentQueryLoading={parentQueryLoading}
          />
        )}
        <FABContainer>
          <FloatingActionButton
            id="new_event_declaration"
            onClick={this.props.goToEvents}
            icon={() => <PlusTransparentWhite />}
          />
        </FABContainer>
        <NotificationToast />
      </>
    )
  }
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; selectorId?: string }>
) {
  const { match } = props
  return {
    language: state.i18n.language,
    scope: getScope(state),
    userDetails: getUserDetails(state),
    tabId: (match && match.params && match.params.tabId) || 'review',
    selectorId: (match && match.params && match.params.selectorId) || '',
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

export const RegistrarHome = connect(
  mapStateToProps,
  {
    goToEvents: goToEventsAction,
    goToPage: goToPageAction,
    goToRegistrarHomeTab: goToRegistrarHomeTabAction,
    goToReviewDuplicate: goToReviewDuplicateAction,
    goToPrintCertificate: goToPrintCertificateAction
  }
)(injectIntl(withTheme(RegistrarHomeView)))
