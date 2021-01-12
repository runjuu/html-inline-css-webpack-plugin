export interface ReplaceConfig {
  position?: 'before' | 'after'
  removeTarget?: boolean
  target: string
}

export type StyleTagFactory = (params: { style: string }) => string

export const TAP_KEY_PREFIX = 'html-inline-css-webpack-plugin'

export const DEFAULT_REPLACE_CONFIG: ReplaceConfig = {
  target: '</head>',
}

export interface Config {
  filter?(fileName: string): boolean
  leaveCSSFile?: boolean
  replace?: ReplaceConfig
  styleTagFactory?: StyleTagFactory
}

export interface FileCache {
  [fileName: string]: string // file content
}
