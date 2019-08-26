import { escapeRegExp } from 'lodash'

export { escapeRegExp }

export function is(filenameExtension: string) {
  const reg = new RegExp(`\.${filenameExtension}$`)
  return (fileName: string) => reg.test(fileName)
}

export const isCSS = is('css')
