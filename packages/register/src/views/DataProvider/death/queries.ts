import gql from 'graphql-tag'
import { Action } from 'src/forms'

export const GET_DEATH_REGISTRATION_FOR_REVIEW = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        multipleBirth
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      registration {
        id
        contact
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }
        }
        type
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      placeOfBirth {
        address {
          type
          line
          district
          state
          postalCode
          country
        }
      }
      birthLocation
      birthLocationType
      presentAtBirthRegistration
    }
  }
`

export const GET_DEATH_REGISTRATION_FOR_CERTIFICATE = gql`
  query data($id: ID!) {
    fetchDeathRegistration(id: $id) {
      id
      deceased {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        multipleBirth
        identifier {
          id
          type
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      informant {
        relationship
        otherRelationship
        individual {
          id
          name {
            use
            firstNames
            familyName
          }
          birthDate
          dateOfMarriage
          educationalAttainment
          nationality
          multipleBirth
          identifier {
            id
            type
          }
          address {
            type
            line
            district
            state
            postalCode
            country
          }
          telecom {
            system
            value
          }
        }
      }
      registration {
        id
        contact
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }

          location {
            name
            alias
          }
          office {
            name
            alias
            address {
              district
              state
            }
          }
        }

        trackingId
        registrationNumber
      }
      placeOfDeath {
        address {
          type
          line
          district
          state
          postalCode
          country
        }
      }
      deathLocation
      mannerOfDeath
      causeOfDeathMethod
      causeOfDeath
    }
  }
`

export function getDeathQueryMappings(action: Action) {
  switch (action) {
    case Action.LOAD_REVIEW_APPLICATION:
      return {
        query: GET_DEATH_REGISTRATION_FOR_REVIEW,
        dataKey: 'fetchDeathRegistration'
      }
    case Action.LOAD_CERTIFICATE_APPLICATION:
      return {
        query: GET_DEATH_REGISTRATION_FOR_CERTIFICATE,
        dataKey: 'fetchDeathRegistration'
      }
    default:
      return null
  }
}
