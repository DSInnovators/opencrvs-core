import { defineMessages } from 'react-intl'

interface IErrorMessages {
  draftFailed: ReactIntl.FormattedMessage.MessageDescriptor
  duplicateQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  errorCodeUnauthorized: ReactIntl.FormattedMessage.MessageDescriptor
  errorDescription1: ReactIntl.FormattedMessage.MessageDescriptor
  errorDescription2: ReactIntl.FormattedMessage.MessageDescriptor
  errorTitle: ReactIntl.FormattedMessage.MessageDescriptor
  errorTitleUnauthorized: ReactIntl.FormattedMessage.MessageDescriptor
  fieldAgentQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  pleaseTryAgainError: ReactIntl.FormattedMessage.MessageDescriptor
  printQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  queryError: ReactIntl.FormattedMessage.MessageDescriptor
  registrationQueryError: ReactIntl.FormattedMessage.MessageDescriptor
  unauthorized: ReactIntl.FormattedMessage.MessageDescriptor
  userQueryError: ReactIntl.FormattedMessage.MessageDescriptor
}

const messagesToDefine: IErrorMessages = {
  draftFailed: {
    defaultMessage:
      'This is some messaging on advicing the user on what to do... in the event of a failed applicaton.',
    description: 'Tips for failed applications',
    id: 'error.draftFailed'
  },
  duplicateQueryError: {
    defaultMessage: 'An error occurred while fetching data',
    description: 'The error message shown when a search query fails',
    id: 'duplicates.queryError'
  },
  errorCodeUnauthorized: {
    defaultMessage: '401',
    description: 'Error code',
    id: 'error.code'
  },
  errorDescription1: {
    defaultMessage: 'Something went wrong.',
    description: 'Error description',
    id: 'error.somethingWentWrong'
  },
  errorDescription2: {
    defaultMessage: "It's not you, it us. This is our fault.",
    description: 'Error description',
    id: 'error.weAreTryingToFixThisError'
  },
  errorTitle: {
    defaultMessage: 'Whoops!',
    description: 'Error title',
    id: 'error.title'
  },
  errorTitleUnauthorized: {
    defaultMessage: 'Unauthorized!',
    description: 'Error title unauthorized',
    id: 'error.title.unauthorized'
  },
  fieldAgentQueryError: {
    defaultMessage: 'An error occured while loading applications',
    description: 'The text when error ocurred loading rejected applications',
    id: 'fieldAgentHome.queryError'
  },
  pleaseTryAgainError: {
    defaultMessage: 'An error occured. Please try again.',
    description:
      'The error message that displays if we wnat the user to try the action again',
    id: 'error.occured'
  },
  printQueryError: {
    defaultMessage:
      'An error occurred while quering for birth registration data',
    description: 'The error message shown when a query fails',
    id: 'print.certificate.queryError'
  },
  queryError: {
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails',
    id: 'error.search'
  },
  registrationQueryError: {
    defaultMessage: 'An error occurred while fetching birth registration',
    description: 'The error message shown when a query fails',
    id: 'review.birthRegistration.queryError'
  },
  unauthorized: {
    defaultMessage: 'We are unable to display this page to you',
    description: 'The error message shown when a query fails',
    id: 'review.error.unauthorized'
  },
  userQueryError: {
    defaultMessage: 'An error occured while loading system users',
    description: 'The text when error ocurred loading system users',
    id: 'system.user.queryError'
  }
}

export const errorMessages: IErrorMessages = defineMessages(messagesToDefine)
