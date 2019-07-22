import {
  ICON_ALIGNMENT,
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { EventTopBar } from '@opencrvs/components/lib/interface'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import {
  deleteApplication,
  IApplication,
  IPayload,
  modifyApplication,
  SUBMISSION_STATUS,
  writeApplication
} from '@register/applications'

import { FormFieldGenerator } from '@register/components/form'
import { RejectRegistrationForm } from '@register/components/review/RejectRegistrationForm'
import {
  Event,
  IForm,
  IFormField,
  IFormSection,
  IFormSectionData
} from '@register/forms'
import {
  goBack as goBackAction,
  goToHome,
  goToPage as goToPageAction
} from '@register/navigation'
import { toggleDraftSavedNotification } from '@register/notification/actions'
import { IOfflineDataState } from '@register/offline/reducer'
import { HOME } from '@register/navigation/routes'
import { getOfflineState } from '@register/offline/selectors'
import { getScope } from '@register/profile/profileSelectors'
import { IStoreState } from '@register/store'
import styled from '@register/styledComponents'
import { Scope } from '@register/utils/authUtils'
import { ReviewSection } from '@register/views/RegisterForm/review/ReviewSection'
import { isNull, isUndefined, merge } from 'lodash'
// @ts-ignore - Required for mocking
import debounce from 'lodash/debounce'
import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

const FormSectionTitle = styled.h3`
  ${({ theme }) => theme.fonts.h3Style};
  color: ${({ theme }) => theme.colors.copy};
`
const FooterArea = styled.div`
  margin: 24px 0px 48px;
`

const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  padding: 25px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.bigBodyStyle};
  margin: 30px -25px;
`

const StyledLinkButton = styled(LinkButton)`
  margin-left: 32px;
`

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  newBirthRegistration: {
    id: 'register.form.newBirthRegistration',
    defaultMessage: 'New birth application',
    description: 'The message that appears for new birth registrations'
  },
  newVitalEventRegistration: {
    id: 'register.form.newVitalEventRegistration',
    defaultMessage:
      'New {event, select, birth {birth} death {death} marriage {marriage} divorce {divorce} adoption {adoption}} application',
    description: 'The message that appears for new vital event registration'
  },
  previewEventRegistration: {
    id: 'register.form.previewEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} Application Preview',
    description: 'The message that appears for new birth registrations'
  },
  reviewEventRegistration: {
    id: 'register.form.reviewEventRegistration',
    defaultMessage:
      '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} adoption {Adoption}} Application Review',
    description: 'The message that appears for new birth registrations'
  },
  saveDraft: {
    id: 'register.form.saveDraft',
    defaultMessage: 'Save draft',
    description: 'Save draft button'
  },
  next: {
    id: 'register.form.next',
    defaultMessage: 'Next',
    description: 'Next button'
  },
  submitDescription: {
    id: 'register.form.modal.submitDescription',
    defaultMessage:
      'By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.',
    description: 'Submit description text on submit modal'
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  valueSaveAsDraft: {
    id: 'register.form.saveDraft',
    defaultMessage: 'Save as draft',
    description: 'Save as draft Button Text'
  },
  optionalLabel: {
    id: 'formFields.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  },
  submitConfirmation: {
    id: 'modal.title.submitConfirmation',
    defaultMessage: 'Are you ready to submit?',
    description: 'Title for submit confirmation modal'
  },
  queryError: {
    id: 'register.registerForm.queryError',
    defaultMessage:
      'The page cannot be loaded at this time due to low connectivity or a network error. Please click refresh to try again, or try again later.',
    description: 'The error message shown when a search query fails'
  },
  continueButton: {
    id: 'register.selectVitalEvent.continueButton',
    defaultMessage: 'Continue',
    description: 'Continue Button Text'
  },
  saveExitButton: {
    id: 'register.selectVitalEvent.saveExitButton',
    defaultMessage: 'SAVE & EXIT',
    description: 'SAVE & EXIT Button Text'
  },
  exitButton: {
    id: 'register.review.eventTopBar.exitButton',
    defaultMessage: 'EXIT',
    description: 'Label for Exit button on EventTopBar'
  },
  backToReviewButton: {
    id: 'register.selectVitalEvent.backToReviewButton',
    defaultMessage: 'Back to review'
  }
})

const Optional = styled.span.attrs<
  { disabled?: boolean } & React.LabelHTMLAttributes<HTMLLabelElement>
>({})`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.placeholder};
  flex-grow: 0;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`
function getActiveSectionId(form: IForm, viewParams: { pageId?: string }) {
  return viewParams.pageId || form.sections[0].id
}

function getNextSection(sections: IFormSection[], fromSection: IFormSection) {
  const currentIndex = sections.findIndex(
    (section: IFormSection) => section.id === fromSection.id
  )

  if (currentIndex === sections.length - 1) {
    return null
  }

  return sections[currentIndex + 1]
}

export interface IFormProps {
  application: IApplication
  registerForm: IForm
  pageRoute: string
  duplicate?: boolean
}

type DispatchProps = {
  goToPage: typeof goToPageAction
  goBack: typeof goBackAction
  goToHome: typeof goToHome
  writeApplication: typeof writeApplication
  modifyApplication: typeof modifyApplication
  deleteApplication: typeof deleteApplication
  toggleDraftSavedNotification: typeof toggleDraftSavedNotification
  handleSubmit: (values: unknown) => void
}

type Props = {
  activeSection: IFormSection
  setAllFieldsDirty: boolean
  offlineResources: IOfflineDataState
}

export type FullProps = IFormProps &
  Props &
  DispatchProps &
  InjectedIntlProps & { scope: Scope } & RouteComponentProps<{
    pageId: string
    applicationId: string
  }>

type State = {
  isDataAltered: boolean
  rejectFormOpen: boolean
  hasError: boolean
}
const VIEW_TYPE = {
  REVIEW: 'review',
  PREVIEW: 'preview'
}

class RegisterFormView extends React.Component<FullProps, State> {
  constructor(props: FullProps) {
    super(props)
    this.state = {
      isDataAltered: false,
      rejectFormOpen: false,
      hasError: false
    }
  }

  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  modifyApplication = (
    sectionData: IFormSectionData,
    activeSection: IFormSection,
    application: IApplication
  ) => {
    if (application.review && !this.state.isDataAltered) {
      this.setState({ isDataAltered: true })
    }
    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        [activeSection.id]: {
          ...application.data[activeSection.id],
          ...sectionData
        }
      }
    })
  }

  confirmSubmission = (
    application: IApplication,
    submissionStatus: string,
    action: string,
    payload?: IPayload
  ) => {
    application.submissionStatus = submissionStatus
    application.action = action
    application.payload = payload
    this.props.modifyApplication(application)
    this.props.history.push(HOME)
  }

  generateSectionListForReview = (
    disabled: boolean,
    sections: IFormSection[]
  ) => {
    const result: IFormSection[] = []
    sections.map((section: IFormSection) => {
      result.push(
        merge(
          {
            disabled: section.viewType !== VIEW_TYPE.REVIEW && disabled
          },
          section
        )
      )
    })
    return result
  }

  toggleRejectForm = () => {
    this.setState(state => ({
      rejectFormOpen: !state.rejectFormOpen
    }))
  }

  getEvent() {
    const eventType = this.props.application.event || 'BIRTH'
    switch (eventType.toLocaleLowerCase()) {
      case 'birth':
        return Event.BIRTH
      case 'death':
        return Event.DEATH
      default:
        return Event.BIRTH
    }
  }

  onSaveAsDraftClicked = () => {
    this.props.writeApplication(this.props.application)
    this.props.goToHome()
    this.props.toggleDraftSavedNotification()
  }

  continueButtonHandler = (
    pageRoute: string,
    applicationId: string,
    pageId: string,
    event: string
  ) => {
    this.props.writeApplication(this.props.application)
    this.props.goToPage(pageRoute, applicationId, pageId, event)
  }

  render() {
    const {
      intl,
      setAllFieldsDirty,
      application,
      registerForm,
      offlineResources,
      handleSubmit,
      duplicate,
      activeSection
    } = this.props

    let nextSection = getNextSection(
      registerForm.sections,
      activeSection
    ) as IFormSection

    if (nextSection && nextSection.viewType === 'hidden') {
      nextSection = getNextSection(
        registerForm.sections,
        nextSection
      ) as IFormSection
    }

    const title =
      activeSection.viewType === VIEW_TYPE.REVIEW
        ? messages.reviewEventRegistration
        : activeSection.viewType === VIEW_TYPE.PREVIEW
        ? messages.previewEventRegistration
        : messages.newVitalEventRegistration
    const isErrorOccured = this.state.hasError
    const debouncedModifyApplication = debounce(this.modifyApplication, 500)

    return (
      <Container id="informant_parent_view">
        {isErrorOccured && (
          <ErrorText id="error_message_section">
            {intl.formatMessage(messages.queryError)}
          </ErrorText>
        )}
        {!isErrorOccured && (
          <>
            {activeSection.viewType === VIEW_TYPE.PREVIEW && (
              <>
                <EventTopBar
                  title={intl.formatMessage(title, {
                    event: application.event
                  })}
                  iconColor={
                    application.submissionStatus === SUBMISSION_STATUS.DRAFT
                      ? 'orange'
                      : 'violet'
                  }
                  saveAction={{
                    handler: this.onSaveAsDraftClicked,
                    label: intl.formatMessage(messages.saveExitButton)
                  }}
                  menuItems={[
                    {
                      label: 'Delete Application',
                      handler: () => {
                        this.props.deleteApplication(application)
                        this.props.goToHome()
                      }
                    }
                  ]}
                />
                <ReviewSection
                  pageRoute={this.props.pageRoute}
                  draft={application}
                  submitClickEvent={this.confirmSubmission}
                />
              </>
            )}
            {activeSection.viewType === VIEW_TYPE.REVIEW && (
              <>
                <EventTopBar
                  title={intl.formatMessage(title, {
                    event: application.event
                  })}
                  iconColor={
                    application.submissionStatus === SUBMISSION_STATUS.DRAFT
                      ? 'orange'
                      : 'violet'
                  }
                  saveAction={{
                    handler: this.props.goToHome,
                    label: intl.formatMessage(messages.exitButton)
                  }}
                />
                <ReviewSection
                  pageRoute={this.props.pageRoute}
                  draft={application}
                  rejectApplicationClickEvent={this.toggleRejectForm}
                  submitClickEvent={this.confirmSubmission}
                />
              </>
            )}

            {activeSection.viewType === 'form' && (
              <>
                <EventTopBar
                  title={intl.formatMessage(title, {
                    event: application.event
                  })}
                  iconColor={
                    application.submissionStatus === SUBMISSION_STATUS.DRAFT
                      ? 'orange'
                      : 'violet'
                  }
                  saveAction={{
                    handler: this.onSaveAsDraftClicked,
                    label: intl.formatMessage(messages.saveExitButton)
                  }}
                  menuItems={[
                    {
                      label: 'Delete Application',
                      handler: () => {
                        this.props.deleteApplication(application)
                        this.props.goToHome()
                      }
                    }
                  ]}
                />
                <BodyContent>
                  <TertiaryButton
                    align={ICON_ALIGNMENT.LEFT}
                    icon={() => <BackArrow />}
                    onClick={this.props.goBack}
                  >
                    {intl.formatMessage(messages.back)}
                  </TertiaryButton>
                  <FormSectionTitle
                    id={`form_section_title_${activeSection.id}`}
                  >
                    {intl.formatMessage(activeSection.title)}
                    {activeSection.optional && (
                      <Optional
                        id={`form_section_opt_label_${activeSection.id}`}
                        disabled={activeSection.disabled}
                      >
                        &nbsp;&nbsp;•&nbsp;
                        {intl.formatMessage(messages.optionalLabel)}
                      </Optional>
                    )}
                  </FormSectionTitle>
                  {activeSection.notice && (
                    <Notice id={`form_section_notice_${activeSection.id}`}>
                      {intl.formatMessage(activeSection.notice)}
                    </Notice>
                  )}
                  <form
                    id={`form_section_id_${activeSection.id}`}
                    onSubmit={handleSubmit}
                  >
                    <FormFieldGenerator
                      id={activeSection.id}
                      onChange={values => {
                        debouncedModifyApplication(
                          values,
                          activeSection,
                          application
                        )
                      }}
                      setAllFieldsDirty={setAllFieldsDirty}
                      fields={activeSection.fields}
                      offlineResources={offlineResources}
                      draftData={application.data}
                    />
                  </form>
                  {nextSection && (
                    <FooterArea>
                      <PrimaryButton
                        id="next_section"
                        onClick={() => {
                          this.continueButtonHandler(
                            this.props.pageRoute,
                            application.id,
                            nextSection.id,
                            application.event.toLowerCase()
                          )
                        }}
                      >
                        {intl.formatMessage(messages.continueButton)}
                      </PrimaryButton>
                      {application.review && (
                        <StyledLinkButton
                          id="back-to-review-button"
                          className="item"
                          onClick={() => {
                            this.continueButtonHandler(
                              this.props.pageRoute,
                              application.id,
                              application.submissionStatus &&
                                application.submissionStatus ===
                                  SUBMISSION_STATUS.DRAFT
                                ? 'preview'
                                : 'review',
                              application.event.toLowerCase()
                            )
                          }}
                        >
                          {intl.formatMessage(messages.backToReviewButton)}
                        </StyledLinkButton>
                      )}
                    </FooterArea>
                  )}
                </BodyContent>
              </>
            )}
          </>
        )}
        {this.state.rejectFormOpen && (
          <RejectRegistrationForm
            onBack={this.toggleRejectForm}
            confirmRejectionEvent={this.confirmSubmission}
            duplicate={duplicate}
            draftId={application.id}
            event={this.getEvent()}
            application={application}
          />
        )}
      </Container>
    )
  }
}

export function replaceInitialValues(fields: IFormField[], sectionValues: any) {
  return fields.map(field => ({
    ...field,
    initialValue:
      isUndefined(sectionValues[field.name]) ||
      isNull(sectionValues[field.name])
        ? field.initialValue
        : sectionValues[field.name]
  }))
}

function mapStateToProps(
  state: IStoreState,
  props: IFormProps &
    Props &
    RouteComponentProps<{ pageId: string; applicationId: string }>
) {
  const { match, registerForm, application } = props

  const activeSectionId = getActiveSectionId(registerForm, match.params)

  const activeSection = registerForm.sections.find(
    ({ id }) => id === activeSectionId
  )

  if (!activeSection) {
    throw new Error(`Configuration for tab "${match.params.pageId}" missing!`)
  }

  if (!application) {
    throw new Error(`Draft "${match.params.applicationId}" missing!`)
  }
  const visitedSections = registerForm.sections.filter(({ id }) =>
    Boolean(application.data[id])
  )

  const rightMostVisited = visitedSections[visitedSections.length - 1]

  const setAllFieldsDirty =
    rightMostVisited &&
    registerForm.sections.indexOf(activeSection) <
      registerForm.sections.indexOf(rightMostVisited)

  const fields = replaceInitialValues(
    activeSection.fields,
    application.data[activeSectionId] || {}
  )

  const offlineResources = getOfflineState(state)

  return {
    registerForm,
    scope: getScope(state),
    setAllFieldsDirty,
    offlineResources,
    activeSection: {
      ...activeSection,
      fields
    },
    application
  }
}

export const RegisterForm = connect<
  Props,
  DispatchProps,
  FullProps,
  IStoreState
>(
  mapStateToProps,
  {
    writeApplication,
    modifyApplication,
    deleteApplication,
    goToPage: goToPageAction,
    goBack: goBackAction,
    goToHome,
    toggleDraftSavedNotification,
    handleSubmit: (values: any) => {
      console.log(values)
    }
  }
)(injectIntl<FullProps>(RegisterFormView))
