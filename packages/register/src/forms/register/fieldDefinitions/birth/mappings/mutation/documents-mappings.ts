import { IFormField, IFormData } from '@register/forms'
import { fieldToAttachmentTransformer } from '@register/forms/mappings/mutation/field-mappings'

export const documentForWhomFhirMapping = {
  Child: 'Child',
  Father: 'Father',
  Mother: 'Mother',
  Parent: 'Parent',
  Other: 'Other',
  ChildAge: 'ChildAge'
}

export const sectionMapping = {
  CHILD: [
    documentForWhomFhirMapping.Child,
    documentForWhomFhirMapping.ChildAge
  ],
  MOTHER: [
    documentForWhomFhirMapping.Mother,
    documentForWhomFhirMapping.Parent
  ],
  FATHER: [documentForWhomFhirMapping.Father, documentForWhomFhirMapping]
}

export const documentTypeFhirMapping = {
  'Birth Registration': 'BIRTH_REGISTRATION',
  'National ID (front)': 'NATIONAL_ID_FRONT',
  'National ID (back)': 'NATIONAL_ID_BACK',
  Passport: 'PASSPORT',
  'School Certificate': 'SCHOOL_CERTIFICATE',
  Other: 'OTHER',
  'EPI Card': 'EPI_CARD',
  'EPI Staff Certificate': 'EPI_STAFF_CERTIFICATE',
  'Doctor Certificate': 'DOCTOR_CERTIFICATE',
  'Proof of Place and Date of Birth': 'BIRTH_PLACE_DATE_PROOF',
  'Discharge Certificate': 'DISCHARGE_CERTIFICATE',
  'Proof of birth from medical institution': 'MEDICAL_INSTITUTION',
  'Proof of birth from birth attendant': 'BIRTH_ATTENDANT',
  'Tax Payment Receipt': 'TAX_RECEIPT'
}

export function birthFieldToAttachmentTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  return fieldToAttachmentTransformer(
    transformedData,
    draftData,
    sectionId,
    field,
    'registration',
    documentForWhomFhirMapping,
    documentTypeFhirMapping
  )
}
