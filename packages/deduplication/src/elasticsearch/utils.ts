import { searchComposition } from 'src/elasticsearch/dbhelper'
import { SearchResponse } from 'elasticsearch'
import { MATCH_SCORE_THRESHOLD } from 'src/constants'

export interface ICompositionBody {
  childFirstNames?: string
  childFamilyName?: string
  childFirstNamesLocal?: string
  childFamilyNameLocal?: string
  childDoB?: string
  gender?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherFirstNamesLocal?: string
  motherFamilyNameLocal?: string
  motherDoB?: string
  motherIdentifier?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherFirstNamesLocal?: string
  fatherFamilyNameLocal?: string
  fatherDoB?: string
  fatherIdentifier?: string
}

export async function detectDuplicates(
  compositionIdentifier: string,
  body: ICompositionBody
) {
  const searchResponse = await searchComposition(body)
  const duplicates = findDuplicateIdentifers(
    compositionIdentifier,
    searchResponse
  )
  return duplicates
}

function findDuplicateIdentifers(
  compositionIdentifier: string,
  results: SearchResponse<{}>
) {
  const hits = results.hits.hits
  return hits
    .filter(
      hit =>
        hit._id !== compositionIdentifier && hit._score > MATCH_SCORE_THRESHOLD
    )
    .map(hit => hit._id)
}

export function buildQuery(body: ICompositionBody) {
  const must = []
  const should = []

  if (body.childFirstNames) {
    must.push({
      match: {
        childFirstNames: { query: body.childFirstNames, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.childFamilyName) {
    must.push({
      match: {
        childFamilyName: { query: body.childFamilyName, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.gender) {
    must.push({
      term: {
        gender: body.gender
      }
    })
  }

  if (body.childDoB) {
    must.push({
      term: {
        childDoB: body.childDoB
      }
    })
  }

  if (body.motherFirstNames) {
    should.push({
      match: {
        motherFirstNames: { query: body.motherFirstNames, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.motherFamilyName) {
    should.push({
      match: {
        motherFamilyName: { query: body.motherFamilyName, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.motherDoB) {
    should.push({
      term: {
        childDoB: body.motherDoB
      }
    })
  }

  if (body.motherIdentifier) {
    should.push({
      term: {
        motherIdentifier: {
          value: body.motherIdentifier,
          boost: 2
        }
      }
    })
  }

  if (body.fatherFirstNames) {
    should.push({
      match: {
        fatherFirstNames: { query: body.fatherFirstNames, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.fatherFamilyName) {
    should.push({
      match: {
        fatherFamilyName: { query: body.fatherFamilyName, fuzziness: 'AUTO' }
      }
    })
  }

  if (body.fatherDoB) {
    should.push({
      term: {
        fatherDoB: body.fatherDoB
      }
    })
  }

  if (body.fatherIdentifier) {
    should.push({
      term: {
        fatherIdentifier: {
          value: body.fatherIdentifier,
          boost: 2
        }
      }
    })
  }

  return {
    bool: {
      must,
      should
    }
  }
}
