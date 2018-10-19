import { v4 as uuid } from 'uuid'
import {
  createMotherSection,
  createFatherSection,
  createChildSection,
  createPersonEntryTemplate
} from 'src/features/fhir/templates'
import { IExtension } from 'src/type/person'
import { IContext } from '../transformation'

export function findCompositionSectionInBundle(
  code: string,
  fhirBundle: unknown
) {
  return fhirBundle.entry[0].resource.section.find(
    (section: unknown) => section.code.coding.code === code
  )
}

export function findCompositionSection(code: string, composition: unknown) {
  return composition.section.find(
    (section: unknown) => section.code.coding.code === code
  )
}

export function selectOrCreatePersonResource(
  sectionCode: string,
  fhirBundle: unknown,
  context: IContext
) {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  let personEntry
  if (!section) {
    // create person
    const ref = uuid()
    let personSection
    switch (sectionCode) {
      case 'mother-details':
        personSection = createMotherSection(ref)
        break
      case 'father-details':
        personSection = createFatherSection(ref)
        break
      case 'child-details':
        personSection = createChildSection(ref)
        break
      default:
        throw new Error(`Unknown section code ${sectionCode}`)
    }
    fhirBundle.entry[0].resource.section.push(personSection)
    personEntry = createPersonEntryTemplate(ref)
    fhirBundle.entry.push(personEntry)
  } else {
    personEntry = fhirBundle.entry.find(
      (entry: unknown) => entry.fullUrl === section.entry[0].reference
    )
  }

  return personEntry.resource
}

export function setObjectPropInResourceArray(
  resource: object,
  label: string,
  value: string | string[],
  propName: string,
  context: IContext
) {
  if (!resource[label]) {
    resource[label] = []
  }
  if (!resource[label][context._index[label]]) {
    resource[label][context._index[label]] = {}
  }
  resource[label][context._index[label]][propName] = value
}

export function findExtension(url: string, composition: unknown): IExtension {
  const extension = composition.find((obj: IExtension) => {
    return obj.url === url
  })
  return extension
}
