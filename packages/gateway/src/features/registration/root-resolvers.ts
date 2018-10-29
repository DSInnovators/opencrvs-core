import fetch from 'node-fetch'

import { fhirUrl } from 'src/constants'
import { buildFHIRBundle } from 'src/features/registration/fhir-builders'
import { GQLResolver } from 'src/graphql/schema'
import uuid = require('uuid')

const statusMap = {
  declared: 'preliminary',
  registered: 'final'
}

export const resolvers: GQLResolver = {
  Query: {
    async listBirthRegistrations(_, { status }) {
      const res = await fetch(
        `${fhirUrl}/Composition${status ? `?status=${statusMap[status]}` : ''}`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )

      const bundle = await res.json()

      return bundle.entry.map((entry: { resource: {} }) => entry.resource)
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }) {
      const birthTrackingId = uuid() // TODO: will change this

      const doc = await buildFHIRBundle(
        Object.assign(
          { registration: { trackingId: { birthTrackingId } } },
          details
        ),
        birthTrackingId
      )

      const res = await fetch(fhirUrl, {
        method: 'POST',
        body: JSON.stringify(doc),
        headers: {
          'Content-Type': 'application/fhir+json'
        }
      })

      if (!res.ok) {
        throw new Error(
          `FHIR post to /fhir failed with [${
            res.status
          }] body: ${await res.text()}`
        )
      }

      const resBody = await res.json()
      if (
        !resBody ||
        !resBody.entry ||
        !resBody.entry[0] ||
        !resBody.entry[0].response ||
        !resBody.entry[0].response.location
      ) {
        throw new Error(`FHIR response did not send a valid response`)
      }

      // return the Composition's id
      return resBody.entry[0].response.location.split('/')[3]
    }
  }
}
