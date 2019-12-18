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
import { client } from '@search/elasticsearch/client'
import { ISearchQuery, SortOrder } from '@search/features/search/types'
import { queryBuilder, EMPTY_STRING } from '@search/features/search/utils'

const DEFAULT_SIZE = 10
const DEFAULT_SEARCH_TYPE = 'compositions'

export const searchComposition = async (params: ISearchQuery) => {
  const {
    query = EMPTY_STRING,
    trackingId = EMPTY_STRING,
    contactNumber = EMPTY_STRING,
    registrationNumber = EMPTY_STRING,
    event = EMPTY_STRING,
    status,
    type,
    applicationLocationId = EMPTY_STRING,
    name = EMPTY_STRING,
    createdBy = EMPTY_STRING,
    from = 0,
    size = DEFAULT_SIZE,
    sort = SortOrder.ASC
  } = params

  return client.search({
    type: DEFAULT_SEARCH_TYPE,
    from,
    size,
    body: {
      query: queryBuilder(
        query,
        trackingId,
        contactNumber,
        registrationNumber,
        name,
        applicationLocationId,
        createdBy,
        { event, status, type }
      ),
      sort: [{ dateOfApplication: sort }]
    }
  })
}
