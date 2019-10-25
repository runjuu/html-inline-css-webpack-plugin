export interface ReplaceConfig {
  position?: 'before' | 'after'
  removeTarget?: boolean
  target: string
}

export const TAP_KEY_PREFIX = 'html-inline-css-webpack-plugin'

export const DEFAULT_REPLACE_CONFIG: ReplaceConfig = {
  target: '</head>',
}

export interface Config {
  filter?(fileName: string): boolean
  exclude?(fileName: string): boolean
  leaveCSSFile?: boolean
  replace?: ReplaceConfig
}

export interface FileCache {
  [fileName: string]: string // file content
}
