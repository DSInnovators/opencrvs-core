/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { GQLResolver } from '@gateway/graphql/schema'

interface ISearchEventDataTemplate {
  _type: string
  _id: string
  _source: ISearchDataTemplate
}
interface ISearchDataTemplate {
  [key: string]: string
}
export interface ISearchCriteria {
  applicationLocationId?: string
  status?: string[]
  type?: string[]
  trackingId?: string
  contactNumber?: string
  name?: string
  registrationNumber?: string
  sort?: string
  size?: number
  from?: number
  createdBy?: string
}

export const searchTypeResolvers: GQLResolver = {
  EventSearchSet: {
    // tslint:disable-next-line
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
    operationHistories(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.operationHistories
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
    operationHistories(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.operationHistories
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
    eventLocationId(searchData: ISearchDataTemplate) {
      return searchData.eventLocationId
    },
    duplicates(searchData: ISearchDataTemplate) {
      return searchData.relatesTo
    }
  },
  OperationHistorySearchSet: {
    operatorName(searchData: ISearchDataTemplate) {
      return [
        {
          use: 'en',
          given:
            (searchData.operatorFirstNames && [
              searchData.operatorFirstNames
            ]) ||
            null,
          family:
            (searchData.operatorFamilyName && [
              searchData.operatorFamilyName
            ]) ||
            null
        },
        {
          use: 'bn',
          given:
            (searchData.operatorFirstNamesLocale && [
              searchData.operatorFirstNamesLocale
            ]) ||
            null,
          family:
            (searchData.operatorFamilyNameLocale && [
              searchData.operatorFamilyNameLocale
            ]) ||
            null
        }
      ]
    }
  }
}
