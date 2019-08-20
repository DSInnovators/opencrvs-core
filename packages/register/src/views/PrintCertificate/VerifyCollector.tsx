import * as React from 'react'
import { connect } from 'react-redux'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import {
  goBack,
  goToReviewCertificate,
  goToPrintCertificatePayment
} from '@register/navigation'
import { IDVerifier } from '@register/views/PrintCertificate/IDVerifier'
import { Event, IFormData } from '@register/forms'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { IStoreState } from '@register/store'
import { IApplication, modifyApplication } from '@register/applications'
import { messages } from '@register/i18n/messages/views/certificate'
import { isFreeOfCost } from './calculatePrice'

interface IMatchParams {
  registrationId: string
  eventType: Event
  collector: string
}

interface IStateProps {
  application: IApplication
}
interface IDispatchProps {
  goBack: typeof goBack
  modifyApplication: typeof modifyApplication
  goToReviewCertificate: typeof goToReviewCertificate
  goToPrintCertificatePayment: typeof goToPrintCertificatePayment
}

type IOwnProps = RouteComponentProps<IMatchParams> & InjectedIntlProps

type IFullProps = IStateProps & IDispatchProps & IOwnProps

class VerifyCollectorComponent extends React.Component<IFullProps> {
  handleVerification = () => {
    const event = this.props.application.event
    const eventDate = this.getEventDate(this.props.application.data, event)

    if (isFreeOfCost(event, eventDate)) {
      this.props.goToReviewCertificate(
        this.props.match.params.registrationId,
        event
      )
    } else {
      this.props.goToPrintCertificatePayment(
        this.props.match.params.registrationId,
        event
      )
    }
  }

  getEventDate(data: IFormData, event: Event) {
    switch (event) {
      case Event.BIRTH:
        return data.child.childBirthDate as string
      case Event.DEATH:
        return data.deathEvent.deathDate as string
    }
  }

  render() {
    const { collector } = this.props.match.params
    const { intl, application } = this.props
    return (
      <ActionPageLight
        goBack={this.props.goBack}
        title={intl.formatMessage(messages.certificateCollectionTitle)}
      >
        <IDVerifier
          id="idVerifier"
          title={intl.formatMessage(messages.idCheckTitle)}
          collectorInformation={application.data[collector]}
          actionProps={{
            positiveAction: {
              label: intl.formatMessage(messages.idCheckVerify),
              handler: this.handleVerification
            },
            negativeAction: {
              label: intl.formatMessage(messages.idCheckWithoutVerify),
              handler: this.handleVerification
            }
          }}
        />
      </ActionPageLight>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  ownProps: IOwnProps
): IStateProps => {
  const { registrationId } = ownProps.match.params

  const application = state.applicationsState.applications.find(
    draft => draft.id === registrationId
  ) as IApplication

  return {
    application
  }
}

export const VerifyCollector = connect(
  mapStateToProps,
  {
    goBack,
    modifyApplication,
    goToReviewCertificate,
    goToPrintCertificatePayment
  }
)(injectIntl(VerifyCollectorComponent))
