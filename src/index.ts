/* eslint-disable no-console */
import { createWriteStream } from 'node:fs'
import type { WriteStream } from 'node:fs'
import { color, getTimeStamp } from './utils'

export type LogLevel = 'debug' | 'info' | 'silly' | 'warn' | 'error' | 'custom'

export interface LoggyOptions {
  path?: string
  formatMessageTemplate?: string
}

export interface LogTemplateParams {
  LEVEL: string
  TIME: string
  MESSAGE: string
}

export class BaseLoggy {
  #level: LogLevel
  #options?: LoggyOptions
  #defaultMessageTemplate: string
  #defaultLogPath: string
  #stream: WriteStream

  constructor(level: LogLevel, options?: LoggyOptions) {
    this.#level = level
    this.#options = options
    this.#defaultMessageTemplate = '[{LEVEL}] - [{TIME}] - {MESSAGE}'
    this.#defaultLogPath = 'log.txt'

    if (options?.path)
      this.#stream = createWriteStream(options.path, { flags: 'a' })
    else
      this.#stream = createWriteStream(this.#defaultLogPath, { flags: 'a' })
  }

  /**
   * @description You create your own custom message template if you don't like default formatted message log.
   * @example
   *
   * ```
   * You can parse custom message template
   *
   * 3 variable are available:
   *
   * LEVEL, TIME, MESSAGE
   *
   * Example of log message: `[{LEVEL}] | [{TIME}] | [{MESSAGE}] anything else...`
   *
   * Example usage:
   *
   * `
   * import { createLog } from 'loggy'
   *
   * const logger = createLog('info', {
   *    formatMessageTemplate: '[{LEVEL}] - [{TIME}] - [{MESSAGE}]'
   * })
   *
   * logger.parseMessageTemplate();
   *
   * `
   *
   * ```
   *
   */
  #formatLogFromTemplate(template: string, params: LogTemplateParams): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      if (key in params)
        return params[key as keyof LogTemplateParams]
      else
        throw new Error(`Invalid template key: ${key}`)
    })
  }

  #formatLogMessage(message: string) {
    const options = this.#options

    if (options?.formatMessageTemplate) {
      const { formatMessageTemplate } = options

      return this.#formatLogFromTemplate(formatMessageTemplate, {
        LEVEL: this.#level,
        TIME: getTimeStamp(),
        MESSAGE: message,
      })
    }

    return this.#formatLogFromTemplate(this.#defaultMessageTemplate, {
      LEVEL: this.#level,
      TIME: getTimeStamp(),
      MESSAGE: message,
    })
  }

  log(message: string, overrideLevel?: LogLevel) {
    if (overrideLevel)
      this.#level = overrideLevel

    const _message = this.#formatLogMessage(message)

    switch (this.#level) {
      case 'info':
        console.log(color.fg.cyan, _message)
        break
      case 'warn':
        console.log(color.fg.yellow, _message)
        break
      case 'debug':
        console.log(color.fg.gray, _message)
        break
      case 'error':
        console.log(color.fg.red, _message)
        break
      case 'silly':
        console.log(color.fg.magenta, _message)
        break
      case 'custom':
        console.log(color.fg.white, _message)
        break
      default:
        break
    }

    this.#stream.write(`${_message}\n`)
  }
}

export class Loggy extends BaseLoggy {
  options?: LoggyOptions

  constructor(options?: LoggyOptions) {
    super('debug', options)
  }

  info(message: string) {
    this.log(message, 'info')
  }

  silly(message: string) {
    this.log(message, 'silly')
  }

  debug(message: string) {
    this.log(message, 'debug')
  }

  warn(message: string) {
    this.log(message, 'warn')
  }

  error(message: string) {
    this.log(message, 'error')
  }

  custom(message: string) {
    this.log(message, 'custom')
  }
}

export const createLogger = (options?: LoggyOptions) => new Loggy(options)

const logger = createLogger()

function examples() {
  logger.debug('hello this is debug')
  logger.info('hello this is info')
  logger.warn('hello this is warn')
  logger.custom('hello this is custom')
  logger.error('hello this is error')
  logger.silly('hello this is silly')

  return 10
}

console.log(examples())
