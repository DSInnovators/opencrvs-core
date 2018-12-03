import { testFhirBundle } from 'src/test/utils'
import {
  getSharedContactMsisdn,
  getInformantName,
  getTrackingId,
  getBirthRegistrationNumber,
  getRegStatusCode,
  getPaperFormID,
  getLoggedInPractitionerResource,
  getFromFhir
} from './fhir-utils'
import { pushTrackingId, pushBRN } from './fhir-bundle-modifier'
import { cloneDeep } from 'lodash'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetch from 'jest-fetch-mock'

describe('Verify getSharedContactMsisdn', () => {
  it('Returned shared contact number properly', () => {
    const phoneNumber = getSharedContactMsisdn(testFhirBundle)
    expect(phoneNumber).toEqual('+8801622688231')
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getSharedContactMsisdn({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError('Invalid FHIR bundle found for declaration')
  })

  it('Throws error when invalid shared contact info given', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.extension[0].valueString = 'INVALID'
    expect(() => getSharedContactMsisdn(fhirBundle)).toThrowError(
      "Invalid Informant's shared contact information found"
    )
  })

  it('Throws error when telecom is missing for shared contact', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.extension[0].valueString = 'FATHER'
    expect(() => getSharedContactMsisdn(fhirBundle)).toThrowError(
      "Didn't find any contact point for informant's shared contact"
    )
  })

  it('Throws error when phonenumber is missing for shared contact', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[3].resource.telecom = []
    expect(() => getSharedContactMsisdn(fhirBundle)).toThrowError(
      "Didn't find any phone number for informant's shared contact"
    )
  })
})

describe('Verify getInformantName', () => {
  it('Returned informant name properly', () => {
    const informantName = getInformantName(testFhirBundle)
    expect(informantName).toEqual('অনিক অনিক')
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getInformantName({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError(
      'getInformantName: Invalid FHIR bundle found for declaration'
    )
  })

  it('Throws error when child name section is missing', () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = undefined
    expect(() => getInformantName(fhirBundle)).toThrowError(
      "Didn't find informant's name information"
    )
  })

  it("Throws error when child's bn name block is missing", () => {
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[2].resource.name = []
    expect(() => getInformantName(fhirBundle)).toThrowError(
      "Didn't found informant's bn name"
    )
  })
})

describe('Verify getTrackingId', () => {
  it('Returned tracking id properly', () => {
    const trackingid = getTrackingId(pushTrackingId(testFhirBundle))
    expect(trackingid).toMatch(/^B/)
    expect(trackingid.length).toBe(7)
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getTrackingId({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError('getTrackingId: Invalid FHIR bundle found for declaration')
  })
})

describe('Verify getBirthRegistrationNumber', () => {
  it('Returned birth registration number properly', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: '5bdc55ece42c82de9a529c36',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    fetch.mockResponses(
      [
        JSON.stringify({
          mobile: '+880711111111'
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Bundle',
          id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
          meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
          type: 'searchset',
          total: 1,
          link: [
            {
              relation: 'self',
              url:
                'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
              resource: {
                resourceType: 'Practitioner',
                identifier: [
                  { use: 'official', system: 'mobile', value: '01711111111' }
                ],
                telecom: [{ system: 'phone', value: '01711111111' }],
                name: [
                  { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                  { use: 'bn', family: [''], given: [''] }
                ],
                gender: 'male',
                meta: {
                  lastUpdated: '2018-11-25T17:31:08.062+00:00',
                  versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
                },
                id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
              }
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          entry: [
            {
              fullUrl:
                'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
              resource: {
                resourceType: 'PractitionerRole',
                practitioner: {
                  reference: 'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                },
                code: [
                  {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/roles',
                        code: 'FIELD_AGENT'
                      }
                    ]
                  }
                ],
                location: [
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                  },
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdxxx'
                  },
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdyyyy'
                  }
                ],
                meta: {
                  lastUpdated: '2018-11-25T17:31:08.096+00:00',
                  versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                },
                id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
              }
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UPAZILA'
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION'
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'DISTRICT'
            }
          ]
        }),
        { status: 200 }
      ]
    )
    const brn = getBirthRegistrationNumber(await pushBRN(testFhirBundle, token))

    expect(brn).toBeDefined()
    expect(brn).toMatch(
      new RegExp(`^${new Date().getFullYear()}10342112345678`)
    )
  })

  it('Throws error when invalid fhir bundle is sent', () => {
    expect(() =>
      getBirthRegistrationNumber({
        resourceType: 'Bundle',
        type: 'document'
      })
    ).toThrowError("Didn't find any identifier for birth registration number")
  })
})

describe('Verify getRegStatusCode', () => {
  it('Returned right registration status based on token scope', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1',
      scope: ['register']
    }
    const regStatus = getRegStatusCode(tokenPayload)
    expect(regStatus).toBeDefined()
    expect(regStatus).toBe('REGISTERED')
  })

  it('Throws error when invalid token has no scope', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1'
    }
    expect(() => getRegStatusCode(tokenPayload)).toThrowError(
      'No scope found on token'
    )
  })

  it('Throws error when invalid token scope is provided', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1',
      scope: ['invalid']
    }
    expect(() => getRegStatusCode(tokenPayload)).toThrowError(
      'No valid scope found on token'
    )
  })
  describe('Verify getPaperFormID', () => {
    it('Returned paper form id properly', () => {
      const paperFormID = getPaperFormID(testFhirBundle)
      expect(paperFormID).toEqual('12345678')
    })
    it('Throws error when paper form id not found', () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.identifier = []
      expect(() => getPaperFormID(fhirBundle)).toThrowError(
        "Didn't find any identifier for paper form id"
      )
    })
  })
  describe('Verify getLoggedInPractitionerResource', () => {
    it('Returns Location properly', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            mobile: '+880711111111'
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
            meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
            type: 'searchset',
            total: 1,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
                resource: {
                  resourceType: 'Practitioner',
                  identifier: [
                    { use: 'official', system: 'mobile', value: '01711111111' }
                  ],
                  telecom: [{ system: 'phone', value: '01711111111' }],
                  name: [
                    { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                    { use: 'bn', family: [''], given: [''] }
                  ],
                  gender: 'male',
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.062+00:00',
                    versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
                  },
                  id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                }
              }
            ]
          }),
          { status: 200 }
        ]
      )
      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: '5bdc55ece42c82de9a529c36',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )
      const location = await getLoggedInPractitionerResource(token)
      expect(location).toEqual({
        resourceType: 'Practitioner',
        identifier: [
          { use: 'official', system: 'mobile', value: '01711111111' }
        ],
        telecom: [{ system: 'phone', value: '01711111111' }],
        name: [
          { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
          { use: 'bn', family: [''], given: [''] }
        ],
        gender: 'male',
        meta: {
          lastUpdated: '2018-11-25T17:31:08.062+00:00',
          versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
        },
        id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
      })
    })
    it('Throws error when partitioner resource is not there', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            mobile: '+880711111111'
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            data: 'ivalid'
          }),
          { status: 200 }
        ]
      )
      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: '5bdc55ece42c82de9a529c36',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )
      expect(getLoggedInPractitionerResource(token)).rejects.toThrowError()
    })
  })
})