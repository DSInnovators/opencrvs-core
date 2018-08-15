import * as React from 'react'
import { InjectedIntlProps, defineMessages } from 'react-intl'
import { InjectedFormProps } from 'redux-form'
import { InputField } from '@opencrvs/components/lib/forms'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Box } from '@opencrvs/components/lib/interface'
import { EnglishText } from '@opencrvs/components/lib/typography'
import styled from 'styled-components'
import { stepOneFields } from './stepOneFields'
import { getFieldProps } from '../../utils/fieldUtils'
import { Field } from 'redux-form'
import { localizeInput } from '../../i18n/components/localizeInput'
import { IAuthenticationData } from '@opencrvs/login/src/utils/authApi'

export const messages = defineMessages({
  stepOneTitle: {
    id: 'login.stepOneTitle',
    defaultMessage: 'Login',
    description: 'The title that appears in step one of the form'
  },
  stepOneInstruction: {
    id: 'login.stepOneInstruction',
    defaultMessage: 'Please enter your mobile number and password.',
    description: 'The instruction that appears in step one of the form'
  },
  mobileLabel: {
    id: 'login.mobileLabel',
    defaultMessage: 'Mobile number',
    description: 'The label that appears on the mobile number input'
  },
  mobilePlaceholder: {
    id: 'login.mobilePlaceholder',
    defaultMessage: '07XXXXXXXXX',
    description: 'The placeholder that appears on the mobile number input'
  },
  passwordLabel: {
    id: 'login.passwordLabel',
    defaultMessage: 'Password',
    description: 'The label that appears on the password input'
  },
  submit: {
    id: 'login.submit',
    defaultMessage: 'Submit',
    description: 'The label that appears on the submit button'
  },
  submissionError: {
    id: 'login.submissionError',
    defaultMessage: 'Sorry that mobile number and password did not work.',
    description:
      'The error that appears when the user entered details are unauthorised'
  }
})

export const StyledBox = styled(Box)`
  position: absolute;
  height: auto;
  top: 50%;
  right: 50%;
  padding: 0px;
  margin: 0px;
  transform: translate(50%, -50%);
`

export const FormWrapper = styled.form`
  position: relative;
  margin: auto;
  width: 80%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 90%;
  }
  margin-bottom: 50px;
  padding-top: 20px;
`

export const ActionWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  display: flex;
`

export const Title = styled.div`
  margin: auto;
  margin-top: 30px;
  width: 80%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    width: 90%;
  }
`

export const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
`

const FieldWrapper = styled.div`
  margin-bottom: 30px;
`

export interface IProps {
  formId: string
  submissionError: boolean
}
export interface IDispatchProps {
  submitAction: (values: IAuthenticationData) => void
}

type IStepOneForm = IProps & IDispatchProps

const LocalizedInputField = localizeInput(InputField)

export class StepOneForm extends React.Component<
  InjectedIntlProps &
    InjectedFormProps<IAuthenticationData, IStepOneForm> &
    IStepOneForm
> {
  render() {
    const {
      intl,
      handleSubmit,
      formId,
      submitAction,
      submissionError
    } = this.props
    return (
      <StyledBox id="login-step-one-box" columns={4}>
        <Title>
          <h2>
            <EnglishText>OpenCRVS </EnglishText>
            {intl.formatMessage(messages.stepOneTitle)}
          </h2>
          <p>{intl.formatMessage(messages.stepOneInstruction)}</p>
          {submissionError && (
            <ErrorText>
              {intl.formatMessage(messages.submissionError)}
            </ErrorText>
          )}
        </Title>
        <FormWrapper id={formId} onSubmit={handleSubmit(submitAction)}>
          <FieldWrapper>
            <Field
              {...getFieldProps(intl, stepOneFields.mobile, messages)}
              component={LocalizedInputField}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Field
              {...getFieldProps(intl, stepOneFields.password, messages)}
              component={LocalizedInputField}
            />
          </FieldWrapper>
          <ActionWrapper>
            <PrimaryButton id="login-mobile-submit" type="submit">
              {intl.formatMessage(messages.submit)}
            </PrimaryButton>
          </ActionWrapper>
        </FormWrapper>
      </StyledBox>
    )
  }
}