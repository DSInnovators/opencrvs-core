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
import fetch from 'node-fetch'

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
const OPENHIM_URL = process.env.OPENHIM_URL || 'http://localhost:5001'

// tslint:disable-next-line:no-console
console.log(`Connecting to auth: ${AUTH_URL} openhim: ${OPENHIM_URL}`)

export const body = {
  child: {
    // Required!
    first_names_en: ['Import'],
    last_name_en: 'Test', // Required!
    first_names_bn: ['ঞমড়গপট'],
    last_name_bn: 'ঠডুট', // Required!
    sex: 'male'
  },
  father: {
    first_names_en: ['Dad'],
    last_name_en: 'Test',
    first_names_bn: ['ঠডুট'],
    last_name_bn: 'ঠডুট',
    nid: '9876543210123'
  },
  mother: {
    first_names_en: ['Mom'],
    last_name_en: 'Test',
    first_names_bn: ['ঠডুট'],
    last_name_bn: 'ঠডুট',
    nid: '1234567890123'
  },
  permanent_address: {
    division: {
      id: '30', // These ids must match BBS codes in future
      name: ''
    },
    district: {
      id: '33', // These ids must match BBS codes in future
      name: ''
    },
    upazila: {
      id: '34', // These ids must match BBS codes in future
      name: ''
    },
    union: {
      // Required!
      id: '94', // These ids must match BBS codes in future
      name: ''
    }
  },
  phone_number: '+88071111111', // Required!
  date_birth: '1565097042000', // Required!
  place_of_birth: {
    id: '24480', // These ids must match Central HRIS MoHFW APU Facility List ids for institution
    name: 'Dr. Nuruzzaman Khokon CC - Narsingdi Sadar'
  },
  union_birth_ocurred: {
    // Required!
    id: '', // These ids must match BBS codes in future
    name: ''
  }
}

if (!module.parent) {
  ;(async () => {
    const authRes = await fetch(`${AUTH_URL}/authenticate`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'api.user',
        password: 'test'
      })
    })

    const authResBody = await authRes.json()

    // tslint:disable-next-line:no-console
    console.log(authResBody)

    const res = await fetch(`${OPENHIM_URL}/dhis2-notification/birth`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: authResBody.token
      }
    })

    const resBody = await res.text()

    // tslint:disable-next-line:no-console
    console.log(`${res.statusText} - ${res.status}`)
    // tslint:disable-next-line:no-console
    console.log(resBody)
  })().catch(err => {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
  })
}
