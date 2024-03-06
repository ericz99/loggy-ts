/* eslint-disable no-console */
import { createReadStream, createWriteStream } from 'node:fs'
import type { WriteStream } from 'node:fs'
import { blob } from 'node:stream/consumers'
import { File } from 'node:buffer'
import { UTApi } from 'uploadthing/server'
import { color, getTimeStamp } from './utils'

export type LogLevel = 'debug' | 'info' | 'silly' | 'warn' | 'error' | 'custom'

export interface LoggyOptions {
  path?: string
  formatMessageTemplate?: string
  backupDuration?: number
  shouldBackUp?: boolean
  logLevelColor?: {
    [key in LogLevel]?: {
      color: keyof typeof color.fg
    }
  }
  cloud?: {
    ut: {
      apiKey: string
    }
  }
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
  #utApi: UTApi | undefined
  #lastBackupTS: number | undefined
  #nextBackupTS: number | undefined

  constructor(level: LogLevel, options?: LoggyOptions) {
    this.#level = level
    this.#options = options
    this.#defaultMessageTemplate = '[{LEVEL}] - [{TIME}] - {MESSAGE}'
    this.#defaultLogPath = 'log.txt' // log-timestamp.txt

    if (options?.cloud?.ut.apiKey) {
      this.#utApi = new UTApi({
        apiKey: this.#options?.cloud?.ut.apiKey,
      })
    }

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

  #overrideLogLevelColor(type: LogLevel, c: string) {
    if (this.#options?.logLevelColor) {
      const { logLevelColor } = this.#options

      if (logLevelColor[type]?.color)
        return color.fg[logLevelColor[type]!.color]

      return c
    }

    return c
  }

  async log(message: string, overrideLevel?: LogLevel) {
    if (overrideLevel)
      this.#level = overrideLevel

    const _message = this.#formatLogMessage(message)

    switch (this.#level) {
      case 'info':
        console.log(this.#overrideLogLevelColor('info', color.fg.cyan), _message)
        break
      case 'warn':
        console.log(this.#overrideLogLevelColor('warn', color.fg.yellow), _message)
        break
      case 'debug':
        console.log(this.#overrideLogLevelColor('debug', color.fg.gray), _message)
        break
      case 'error':
        console.log(this.#overrideLogLevelColor('error', color.fg.red), _message)
        break
      case 'silly':
        console.log(this.#overrideLogLevelColor('silly', color.fg.magenta), _message)
        break
      case 'custom':
        console.log(this.#overrideLogLevelColor('custom', color.fg.white), _message)
        break
      default:
        break
    }

    const currentTS = new Date().getTime()

    if (this.#options) {
      const { shouldBackUp, backupDuration } = this.#options

      if (shouldBackUp && backupDuration) {
        const { cloud } = this.#options

        if (!cloud)
          throw new Error('Should provide cloud if you want to backup!')

        // # create new file
        const _blob = await blob(createReadStream(this.#defaultLogPath))
        const file = new File([_blob], this.#defaultLogPath + String(currentTS))

        if (!this.#lastBackupTS && !this.#nextBackupTS) {
          this.#lastBackupTS = currentTS
          this.#nextBackupTS = this.#lastBackupTS! + backupDuration

          if (this.#utApi) {
            // # upload to ut
            await this.#utApi.uploadFiles(file)
          }
        }

        if (currentTS > this.#nextBackupTS!) {
          this.#lastBackupTS = currentTS
          this.#nextBackupTS = this.#lastBackupTS! + backupDuration

          if (this.#utApi) {
            // # upload to ut
            await this.#utApi.uploadFiles(file)
          }
        }
      }
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

/**
 *
 * @param options
 * @description create logger
 * @returns {Loggy}
 */
export const createLogger = (options?: LoggyOptions): Loggy => new Loggy(options)
