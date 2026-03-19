export function escapeRegExp(str: string): string {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
}

export function is(filenameExtension: string) {
  const reg = new RegExp(`\.${filenameExtension}$`)
  return (fileName: string) => reg.test(fileName)
}

export const isCSS = is('css')
