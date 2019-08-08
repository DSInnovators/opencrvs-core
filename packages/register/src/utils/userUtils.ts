import {
  GQLLocation,
  GQLUser,
  GQLHumanName,
  GQLIdentifier
} from '@opencrvs/gateway/src/graphql/schema'
import { storage } from '@opencrvs/register/src/storage'
import { getDefaultLanguage } from '@register/i18n/utils'

export const USER_DETAILS = 'USER_DETAILS'

export interface IIdentifier {
  system: string
  value: string
}
export interface IGQLLocation {
  id: string
  identifier?: IIdentifier[]
  name?: string
  status?: string
}

export interface IUserDetails {
  userMgntUserID?: string
  practitionerId?: string
  mobile?: string
  role?: string
  type?: string
  status?: string
  name?: Array<GQLHumanName | null>
  catchmentArea?: IGQLLocation[]
  primaryOffice?: IGQLLocation
  language: string
}

export function getUserDetails(user: GQLUser): IUserDetails {
  const {
    catchmentArea,
    primaryOffice,
    name,
    mobile,
    role,
    type,
    status,
    userMgntUserID,
    practitionerId
  } = user
  const userDetails: IUserDetails = {
    language: getDefaultLanguage()
  }
  if (userMgntUserID) {
    userDetails.userMgntUserID = userMgntUserID
  }
  if (practitionerId) {
    userDetails.practitionerId = practitionerId
  }
  if (name) {
    userDetails.name = name
  }
  if (mobile) {
    userDetails.mobile = mobile
  }
  if (role) {
    userDetails.role = role
  }
  if (type) {
    userDetails.type = type
  }
  if (status) {
    userDetails.status = status
  }
  if (primaryOffice) {
    userDetails.primaryOffice = {
      id: primaryOffice.id,
      name: primaryOffice.name,
      status: primaryOffice.status
    }
  }

  if (catchmentArea) {
    const areaWithLocations: GQLLocation[] = catchmentArea as GQLLocation[]
    const potentialCatchmentAreas = areaWithLocations.map(
      (cArea: GQLLocation) => {
        if (cArea.identifier) {
          const identifiers: GQLIdentifier[] = cArea.identifier as GQLIdentifier[]
          return {
            id: cArea.id,
            name: cArea.name,
            status: cArea.status,
            identifier: identifiers.map((identifier: GQLIdentifier) => {
              return {
                system: identifier.system,
                value: identifier.value
              }
            })
          }
        }
        return {}
      }
    ) as IGQLLocation[]
    if (potentialCatchmentAreas !== undefined) {
      userDetails.catchmentArea = potentialCatchmentAreas
    }
  }

  return userDetails
}

export function getUserLocation(userDetails: IUserDetails) {
  if (!userDetails.primaryOffice) {
    throw Error('The user has no primary office')
  }

  return userDetails.primaryOffice
}

export async function storeUserDetails(userDetails: IUserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
export async function removeUserDetails() {
  storage.removeItem(USER_DETAILS)
}
