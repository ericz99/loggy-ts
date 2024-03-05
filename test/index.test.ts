import { describe, it } from 'vitest'

import { createLogger } from '../src/index'

const logger = createLogger({
  formatMessageTemplate: '😊 ({TIME}) - ({LEVEL}) - >> {MESSAGE}',
})

describe('logger test', () => {
  it('warn test', () => {
    logger.warn('hello this is warn')
  })

  it('debug test', () => {
    logger.debug('hello this is debug')
  })

  it('debug test', () => {
    logger.debug('hello this is debug')
  })

  it('error test', () => {
    logger.error('hello this is error')
  })

  it('custom test', () => {
    logger.custom('hello this is custom')
  })

  it('silly test', () => {
    logger.silly('hello this is silly')
  })
})
