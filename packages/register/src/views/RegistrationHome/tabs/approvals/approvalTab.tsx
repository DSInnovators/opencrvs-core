import { Validate } from '@opencrvs/components/lib/icons'
import {
  ColumnContentAlignment,
  GridTable
} from '@opencrvs/components/lib/interface'
import { BodyContent } from '@opencrvs/components/lib/layout'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema'
import { goToPage } from '@register/navigation'
import { getScope } from '@register/profile/profileSelectors'
import { transformData } from '@register/search/transformer'
import { IStoreState } from '@register/store'
import styled, { ITheme } from '@register/styledComponents'
import * as Sentry from '@sentry/browser'
import moment from 'moment'
import * as React from 'react'
import { Query } from 'react-apollo'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withTheme } from 'styled-components'
import { messages } from '@register/views/RegistrationHome/messages'
import { SEARCH_EVENTS } from '@register/views/RegistrationHome/queries'
import {
  ErrorText,
  EVENT_STATUS,
  StyledSpinner
} from '@register/views/RegistrationHome/RegistrationHome'
import { RowHistoryView } from '@register/views/RegistrationHome/RowHistoryView'
import ReactTooltip from 'react-tooltip'
import { QUERY_POLLING_INTERVAL } from '@register/utils/constants'

const ToolTipContainer = styled.span`
  text-align: center;
`
interface IBaseApprovalTabProps {
  theme: ITheme
  goToPage: typeof goToPage
  registrarUnion: string | null
  parentQueryLoading?: boolean
}

interface IApprovalTabState {
  approvalCurrentPage: number
}

type IApprovalTabProps = InjectedIntlProps & IBaseApprovalTabProps

class ApprovalTabComponent extends React.Component<
  IApprovalTabProps,
  IApprovalTabState
> {
  pageSize = 10
  constructor(props: IApprovalTabProps) {
    super(props)
    this.state = {
      approvalCurrentPage: 1
    }
  }

  transformValidatedContent = (data: GQLQuery) => {
    if (!data.searchEvents || !data.searchEvents.results) {
      return []
    }
    const transformedData = transformData(data, this.props.intl)

    return transformedData.map(reg => {
      const icon: JSX.Element = (
        <Validate data-tip data-for="validatedTooltip" />
      )
      return {
        ...reg,
        eventTimeElapsed:
          (reg.dateOfEvent &&
            moment(reg.dateOfEvent.toString(), 'YYYY-MM-DD').fromNow()) ||
          '',
        dateOfApproval:
          (reg.modifiedAt &&
            moment(
              moment(reg.modifiedAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          (reg.createdAt &&
            moment(
              moment(reg.createdAt, 'x').format('YYYY-MM-DD HH:mm:ss'),
              'YYYY-MM-DD HH:mm:ss'
            ).fromNow()) ||
          '',
        icon
      }
    })
  }

  onPageChange = (newPageNumber: number) => {
    this.setState({ approvalCurrentPage: newPageNumber })
  }

  renderExpandedComponent = (itemId: string) => {
    return <RowHistoryView eventId={itemId} />
  }

  render() {
    const { theme, intl, registrarUnion, parentQueryLoading } = this.props

    return (
      <Query
        query={SEARCH_EVENTS}
        variables={{
          status: [EVENT_STATUS.VALIDATED],
          locationIds: [registrarUnion],
          count: this.pageSize,
          skip: (this.state.approvalCurrentPage - 1) * this.pageSize
        }}
        pollInterval={QUERY_POLLING_INTERVAL}
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
            return (
              (!parentQueryLoading && (
                <StyledSpinner
                  id="search-result-spinner"
                  baseColor={theme.colors.background}
                />
              )) ||
              null
            )
          }
          if (error) {
            Sentry.captureException(error)
            return (
              <ErrorText id="search-result-error-text-approvals">
                {intl.formatMessage(messages.queryError)}
              </ErrorText>
            )
          }
          return (
            <BodyContent>
              <ReactTooltip id="validatedTooltip">
                <ToolTipContainer>
                  {this.props.intl.formatMessage(
                    messages.validatedApplicationTooltipForRegistrationAgent
                  )}
                </ToolTipContainer>
              </ReactTooltip>
              <GridTable
                content={this.transformValidatedContent(data)}
                columns={[
                  {
                    label: this.props.intl.formatMessage(messages.listItemType),
                    width: 14,
                    key: 'event'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemTrackingNumber
                    ),
                    width: 20,
                    key: 'trackingId'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.listItemEventDate
                    ),
                    width: 28,
                    key: 'eventTimeElapsed'
                  },
                  {
                    label: this.props.intl.formatMessage(
                      messages.sentForApprovals
                    ),
                    width: 28,
                    key: 'dateOfApproval'
                  },
                  {
                    width: 5,
                    key: 'icons',
                    isIconColumn: true
                  },
                  {
                    width: 5,
                    key: 'actions',
                    isActionColumn: true,
                    alignment: ColumnContentAlignment.CENTER
                  }
                ]}
                renderExpandedComponent={this.renderExpandedComponent}
                noResultText={intl.formatMessage(messages.dataTableNoResults)}
                onPageChange={(currentPage: number) => {
                  this.onPageChange(currentPage)
                }}
                pageSize={this.pageSize}
                totalItems={data.searchEvents && data.searchEvents.totalItems}
                currentPage={this.state.approvalCurrentPage}
                expandable={true}
              />
            </BodyContent>
          )
        }}
      </Query>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state)
  }
}

export const ApprovalTab = connect(
  mapStateToProps,
  {
    goToPage: goToPage
  }
)(injectIntl(withTheme(ApprovalTabComponent)))
