import { GQLResolver } from 'src/graphql/schema'

interface ISearchEventDataTemplate {
  _type: string
  _id: string
  _source: ISearchDataTemplate
}
interface ISearchDataTemplate {
  [key: string]: string
}
export interface ISearchCriteria {
  event?: string
  status?: string
  applicationLocationId?: string
  query?: string
  trackingId?: string
  contactNumber?: string
  registrationNumber?: string
  from: number
  size: number
  sort?: string
}

export const searchTypeResolvers: GQLResolver = {
  EventSearchSet: {
    __resolveType(obj: ISearchEventDataTemplate) {
      if (obj._type === 'compositions' && obj._source.event === 'Birth') {
        return 'BirthEventSearchSet'
      } else {
        return 'DeathEventSearchSet'
      }
    }
  },
  BirthEventSearchSet: {
    id(resultSet: ISearchEventDataTemplate) {
      return resultSet._id
    },
    type(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.event
    },
    registration(resultSet: ISearchEventDataTemplate) {
      return resultSet._source
    },
    childName(resultSet: ISearchEventDataTemplate) {
      if (!resultSet._source) {
        return null
      }
      return [
        {
          use: 'en',
          given:
            (resultSet._source.childFirstNames && [
              resultSet._source.childFirstNames
            ]) ||
            null,
          family:
            (resultSet._source.childFamilyName && [
              resultSet._source.childFamilyName
            ]) ||
            null
        },
        {
          use: 'bn',
          given:
            (resultSet._source.childFirstNamesLocal && [
              resultSet._source.childFirstNamesLocal
            ]) ||
            null,
          family:
            (resultSet._source.childFamilyNameLocal && [
              resultSet._source.childFamilyNameLocal
            ]) ||
            null
        }
      ]
    },
    dateOfBirth(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.childDoB) || null
    }
  },
  DeathEventSearchSet: {
    id(resultSet: ISearchEventDataTemplate) {
      return resultSet._id
    },
    type(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.event
    },
    registration(resultSet: ISearchEventDataTemplate) {
      return resultSet._source
    },
    deceasedName(resultSet: ISearchEventDataTemplate) {
      if (!resultSet._source) {
        return null
      }
      return [
        {
          use: 'en',
          given:
            (resultSet._source.deceasedFirstNames && [
              resultSet._source.deceasedFirstNames
            ]) ||
            null,
          family:
            (resultSet._source.deceasedFamilyName && [
              resultSet._source.deceasedFamilyName
            ]) ||
            null
        },
        {
          use: 'bn',
          given:
            (resultSet._source.deceasedFirstNamesLocal && [
              resultSet._source.deceasedFirstNamesLocal
            ]) ||
            null,
          family:
            (resultSet._source.deceasedFamilyNameLocal && [
              resultSet._source.deceasedFamilyNameLocal
            ]) ||
            null
        }
      ]
    },
    dateOfDeath(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.deathDate) || null
    }
  },
  RegistrationSearchSet: {
    status(searchData: ISearchDataTemplate) {
      return searchData.type
    },
    registeredLocationId(searchData: ISearchDataTemplate) {
      return searchData.applicationLocationId
    },
    duplicates(searchData: ISearchDataTemplate) {
      return searchData.relatesTo
    }
  }
}
