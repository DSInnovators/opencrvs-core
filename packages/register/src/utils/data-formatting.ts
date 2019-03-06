import { GQLHumanName, GQLComment } from '@opencrvs/gateway/src/graphql/schema'

export const createNamesMap = (names: GQLHumanName[]) =>
  names.filter(Boolean).reduce((prevNamesMap, name) => {
    if (!name.use) {
      /* tslint:disable:no-string-literal */
      prevNamesMap['default'] = `${name.firstNames} ${
        /* tslint:enable:no-string-literal */
        name.familyName
      }`.trim()
      return prevNamesMap
    }

    prevNamesMap[name.use] = `${name.firstNames} ${name.familyName}`.trim()
    return prevNamesMap
  }, {})

export const extractCommentFragmentValue = (
  comments: GQLComment[],
  fragmentItem: string
): string => {
  let fragmentValue: string = ''

  for (const comment of comments) {
    if (comment.comment) {
      const commentFragments = comment.comment.split('&')
      for (const fragment of commentFragments) {
        if (fragment.includes(`${fragmentItem}=`)) {
          fragmentValue = fragment.replace(`${fragmentItem}=`, '')
          break
        }
      }
    }

    if (fragmentValue.length > 0) {
      break
    }
  }

  return fragmentValue
}
