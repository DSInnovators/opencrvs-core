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
import * as moment from 'moment'
import {
  IBirthKeyFigures,
  IEstimation
} from '@metrics/features/metrics/metricsGenerator'
import {
  MALE,
  FEMALE,
  OPENCRVS_SPECIFICATION_URL,
  CRUD_BIRTH_RATE_SEC,
  TOTAL_POPULATION_SEC,
  MALE_POPULATION_SEC,
  FEMALE_POPULATION_SEC,
  JURISDICTION_TYPE_SEC,
  JURISDICTION_TYPE_IDENTIFIER
} from '@metrics/features/metrics/constants'
import { IAuthHeader } from '@metrics/features/registration'
import { fetchLocation, fetchFromResource, fetchFHIR } from '@metrics/api'
export const YEARLY_INTERVAL = '365d'
export const MONTHLY_INTERVAL = '30d'
export const WEEKLY_INTERVAL = '7d'

export const LABEL_FOMRAT = {
  [YEARLY_INTERVAL]: 'YYYY',
  [MONTHLY_INTERVAL]: 'MMMM',
  [WEEKLY_INTERVAL]: 'DD-MM-YYYY'
}

export interface IPoint {
  time: string
  count: number
}

export interface ICrudeDeathRate {
  crudeDeathRate: number
}

export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH'
}

export type Location = fhir.Location & { id: string }

export const ageIntervals = [
  { title: '45d', minAgeInDays: -1, maxAgeInDays: 45 },
  { title: '46d - 1yr', minAgeInDays: 46, maxAgeInDays: 365 },
  { title: '1yr', minAgeInDays: 366, maxAgeInDays: 730 },
  { title: '2yr', minAgeInDays: 731, maxAgeInDays: 1095 },
  { title: '3yr', minAgeInDays: 1096, maxAgeInDays: 1460 },
  { title: '4yr', minAgeInDays: 1461, maxAgeInDays: 1825 },
  { title: '5yr', minAgeInDays: 1826, maxAgeInDays: 2190 },
  { title: '6yr', minAgeInDays: 2191, maxAgeInDays: 2555 },
  { title: '7yr', minAgeInDays: 2556, maxAgeInDays: 2920 },
  { title: '8yr', minAgeInDays: 2921, maxAgeInDays: 3285 },
  { title: '9r', minAgeInDays: 3286, maxAgeInDays: 3650 },
  { title: '10yr', minAgeInDays: 3651, maxAgeInDays: 4015 }
]

export const calculateInterval = (startTime: string, endTime: string) => {
  const timeStartInMil = parseInt(startTime.substr(0, 13), 10)
  const timeEndInMil = parseInt(endTime.substr(0, 13), 10)
  const diffInDays = moment(timeEndInMil).diff(timeStartInMil, 'days')

  if (diffInDays > 365) {
    return YEARLY_INTERVAL
  } else if (diffInDays > 30 && diffInDays <= 365) {
    return MONTHLY_INTERVAL
  } else {
    return WEEKLY_INTERVAL
  }
}

export const generateEmptyBirthKeyFigure = (
  label: string,
  estimate: number
): IBirthKeyFigures => {
  return {
    label,
    value: 0,
    total: 0,
    estimate,
    categoricalData: [
      {
        name: FEMALE,
        value: 0
      },
      {
        name: MALE,
        value: 0
      }
    ]
  }
}

export const fetchEstimateByLocation = async (
  locationData: Location,
  estimationForDays: number,
  estimatedYear: number,
  event: EVENT_TYPE,
  authHeader: IAuthHeader
): Promise<IEstimation> => {
  let crudRate: number = 0
  let totalPopulation: number = 0

  if (!locationData.extension) {
    throw new Error('Invalid location data found')
  }
  let estimateExtensionFound: boolean = false
  let actualEstimationYear = estimatedYear
  let malePopulationArray: [] = []
  let femalePopulationArray: [] = []
  locationData.extension.forEach(extension => {
    if (
      extension.url === OPENCRVS_SPECIFICATION_URL + CRUD_BIRTH_RATE_SEC &&
      event === EVENT_TYPE.BIRTH
    ) {
      estimateExtensionFound = true
      const valueArray: [] = JSON.parse(extension.valueString as string)
      // tslint:disable-next-line
      for (let key = estimatedYear; key > 1; key--) {
        valueArray.forEach(data => {
          if (key in data) {
            crudRate = data[key]
          }
        })
        if (crudRate > 0) {
          break
        }
      }
    } else if (
      extension.url ===
      OPENCRVS_SPECIFICATION_URL + TOTAL_POPULATION_SEC
    ) {
      estimateExtensionFound = true
      const valueArray: [] = JSON.parse(extension.valueString as string)
      // tslint:disable-next-line
      for (let key = estimatedYear; key > 1; key--) {
        valueArray.forEach(data => {
          if (key in data) {
            totalPopulation = data[key]
            actualEstimationYear = key
          }
        })
        if (totalPopulation > 0) {
          break
        }
      }
    } else if (
      extension.url ===
      OPENCRVS_SPECIFICATION_URL + MALE_POPULATION_SEC
    ) {
      malePopulationArray = JSON.parse(extension.valueString as string)
    } else if (
      extension.url ===
      OPENCRVS_SPECIFICATION_URL + FEMALE_POPULATION_SEC
    ) {
      femalePopulationArray = JSON.parse(extension.valueString as string)
    }
  })
  if (!estimateExtensionFound) {
    return {
      totalEstimation: 0,
      maleEstimation: 0,
      femaleEstimation: 0,
      locationId: locationData.id,
      estimationYear: actualEstimationYear,
      locationLevel: getLocationLevelFromLocationData(locationData)
    }
  }
  if (event === EVENT_TYPE.DEATH) {
    const crudeDeathRateResponse: ICrudeDeathRate = await fetchFromResource(
      'crude-death-rate',
      authHeader
    )
    crudRate = crudeDeathRateResponse.crudeDeathRate
  }
  let populationData =
    malePopulationArray?.find(
      data => data[actualEstimationYear] !== undefined
    )?.[actualEstimationYear] ?? ''
  const malePopulation: number =
    populationData === '' ? totalPopulation / 2 : Number(populationData)

  populationData =
    femalePopulationArray?.find(
      data => data[actualEstimationYear] !== undefined
    )?.[actualEstimationYear] ?? ''
  const femalePopulation: number =
    populationData === '' ? totalPopulation / 2 : Number(populationData)

  return {
    totalEstimation: Math.round(
      ((crudRate * totalPopulation) / 1000) * (estimationForDays / 365)
    ),
    maleEstimation: Math.round(
      ((crudRate * malePopulation) / 1000) * (estimationForDays / 365)
    ),
    femaleEstimation: Math.round(
      ((crudRate * femalePopulation) / 1000) * (estimationForDays / 365)
    ),
    locationId: locationData.id,
    estimationYear: actualEstimationYear,
    locationLevel: getLocationLevelFromLocationData(locationData)
  }
}

export const getLocationLevelFromLocationData = (locationData: Location) => {
  return (
    locationData?.identifier?.find(
      identifier =>
        identifier.system ===
        OPENCRVS_SPECIFICATION_URL + JURISDICTION_TYPE_IDENTIFIER
    )?.value ?? ''
  )
}

export const fetchEstimateFor45DaysByLocationId = async (
  locationId: string,
  estimatedYear: number,
  event: EVENT_TYPE,
  authHeader: IAuthHeader
): Promise<IEstimation> => {
  const locationData: Location = await fetchFHIR(locationId, authHeader)
  return await fetchEstimateByLocation(
    locationData,
    45, // For 45 days
    estimatedYear,
    event,
    authHeader
  )
}

export const getDistrictLocation = async (
  locationId: string,
  authHeader: IAuthHeader
): Promise<Location> => {
  let locationBundle: Location
  let locationType: fhir.Identifier | undefined
  let lId = locationId

  locationBundle = await fetchLocation(lId, authHeader)
  locationType = getLocationType(locationBundle)
  while (
    locationBundle &&
    (!locationType || locationType.value !== 'DISTRICT')
  ) {
    lId =
      (locationBundle &&
        locationBundle.partOf &&
        locationBundle.partOf.reference &&
        locationBundle.partOf.reference.split('/')[1]) ||
      ''
    locationBundle = await fetchLocation(lId, authHeader)
    locationType = getLocationType(locationBundle)
  }

  if (!locationBundle) {
    throw new Error('No district location found')
  }

  return locationBundle
}

function getLocationType(locationBundle: fhir.Location) {
  return (
    locationBundle &&
    locationBundle.identifier &&
    locationBundle.identifier.find(
      identifier =>
        identifier.system === OPENCRVS_SPECIFICATION_URL + JURISDICTION_TYPE_SEC
    )
  )
}

export function fillEmptyDataArrayByKey(
  dataArray: Array<any>,
  emptyDataArray: Array<any>,
  key: string
) {
  const result: Array<any> = []
  for (const eachItem of emptyDataArray) {
    const itemInArray = dataArray.find(
      itemInDataArray => itemInDataArray[key] === eachItem[key]
    )

    result.push(itemInArray || eachItem)
  }

  return result
}

export async function fetchChildLocationIdsByParentId(
  parentLocationId: string,
  currentLocationLevel: string,
  lowerLocationLevel: string,
  authHeader: IAuthHeader
) {
  if (currentLocationLevel !== lowerLocationLevel) {
    const bundle = await fetchFHIR(
      `Location?partof=${parentLocationId}`,
      authHeader
    )

    return (
      (bundle &&
        bundle.entry.map(
          (entry: { resource: { id: string } }) =>
            `Location/${entry.resource.id}`
        )) ||
      []
    )
  }
  return [`Location/${parentLocationId}`]
}
