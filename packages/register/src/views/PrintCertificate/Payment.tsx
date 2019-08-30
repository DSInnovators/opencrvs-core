import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { Print } from '@opencrvs/components/lib/icons'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { IApplication, modifyApplication } from '@register/applications'
import { Event, ICertificate } from '@register/forms'
import { buttonMessages } from '@register/i18n/messages'
import { messages } from '@register/i18n/messages/views/certificate'
import {
  goBack as goBackAction,
  goToReviewCertificate as goToReviewCertificateAction
} from '@register/navigation'
import { getUserDetails } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import { ITheme } from '@register/styledComponents'
import { IUserDetails } from '@register/utils/userUtils'
import { printMoneyReceipt } from '@register/views/PrintCertificate/PDFUtils'
import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import styled, { withTheme } from 'styled-components'
import { calculatePrice, getEventDate, getServiceMessage } from './utils'

const Header = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.black};
  margin-top: 0;
`
const Instruction = styled.p`
  color: ${({ theme }) => theme.colors.copy};
`
const Action = styled.div`
  margin-top: 32px;
`
const GreyBody = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 16px 24px;

  & button {
    margin-top: 16px;
    padding: 0;
  }
`

const StyledLabel = styled.label`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  margin-right: 3px;
`
const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
`

function LabelValue({
  id,
  label,
  value
}: {
  id: string
  label: string
  value: string
}) {
  return (
    <div id={id}>
      <StyledLabel>{label}</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}
interface IProps {
  event: Event
  registrationId: string
  language: string
  application: IApplication
  theme: ITheme
  modifyApplication: typeof modifyApplication
  goToReviewCertificate: typeof goToReviewCertificateAction
  goBack: typeof goBackAction
  userDetails: IUserDetails | null
}

type IFullProps = IProps & InjectedIntlProps

class PaymentComponent extends React.Component<IFullProps> {
  continue = (paymentAmount: string) => {
    const { application } = this.props
    const certificates =
      (application &&
        (application.data.registration.certificates as ICertificate[])) ||
      null
    const certificate: ICertificate = (certificates && certificates[0]) || {}
    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        registration: {
          ...application.data.registration,
          certificates: [
            {
              ...certificate,
              payments: [
                {
                  type: 'MANUAL',
                  total: paymentAmount,
                  amount: paymentAmount,
                  outcome: 'COMPLETED',
                  date: Date.now()
                }
              ]
            }
          ]
        }
      }
    })

    this.props.goToReviewCertificate(
      this.props.registrationId,
      this.props.event
    )
  }

  render = () => {
    const { intl, application, event, goBack } = this.props
    const eventDate = getEventDate(application.data, event)

    const paymentAmount = calculatePrice(event, eventDate)

    const serviceMessage = getServiceMessage(event, eventDate)

    return (
      <>
        <ActionPageLight title={'Certificate collection'} goBack={goBack}>
          <Header>{intl.formatMessage(messages.payment)}</Header>
          <Instruction>
            {intl.formatMessage(messages.paymentInstruction)}
          </Instruction>
          <GreyBody>
            <LabelValue
              id="service"
              label={intl.formatMessage(messages.receiptService)}
              value={intl.formatMessage(serviceMessage)}
            />
            <LabelValue
              id="amountDue"
              label={intl.formatMessage(messages.amountDue)}
              value={intl.formatMessage(messages.paymentAmount, {
                paymentAmount
              })}
            />
            <TertiaryButton
              id="print-receipt"
              icon={() => <Print />}
              align={0}
              onClick={() =>
                printMoneyReceipt(
                  this.props.intl,
                  this.props.application,
                  this.props.userDetails
                )
              }
            >
              {intl.formatMessage(messages.printReceipt)}
            </TertiaryButton>
          </GreyBody>
          <Action>
            <PrimaryButton
              id="Continue"
              onClick={() => this.continue(paymentAmount)}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          </Action>
        </ActionPageLight>
      </>
    )
  }
}

const getEvent = (eventType: string | undefined) => {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.BIRTH
    case 'death':
      return Event.DEATH
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ registrationId: string; eventType: string }>
) {
  const { registrationId, eventType } = props.match.params
  const event = getEvent(eventType)
  const application = state.applicationsState.applications.find(
    app => app.id === registrationId && app.event === event
  )

  if (!application) {
    throw new Error(`Application "${registrationId}" missing!`)
  }

  return {
    event: application.event,
    registrationId,
    language: state.i18n.language,
    application,
    userDetails: getUserDetails(state)
  }
}

export const Payment = connect(
  mapStatetoProps,
  {
    goBack: goBackAction,
    modifyApplication,
    goToReviewCertificate: goToReviewCertificateAction
  }
)(injectIntl(withTheme(PaymentComponent)))
