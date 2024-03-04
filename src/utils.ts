export const getTimeStamp = () => {
  return new Date().toISOString()
}

export const color = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  dim: '\x1B[2m',
  underscore: '\x1B[4m',
  blink: '\x1B[5m',
  reverse: '\x1B[7m',
  hidden: '\x1B[8m',

  fg: {
    black: '\x1B[30m',
    red: '\x1B[31m',
    green: '\x1B[32m',
    yellow: '\x1B[33m',
    blue: '\x1B[34m',
    magenta: '\x1B[35m',
    cyan: '\x1B[36m',
    white: '\x1B[37m',
    gray: '\x1B[90m',
    crimson: '\x1B[38m', // Scarlet
  },
  bg: {
    black: '\x1B[40m',
    red: '\x1B[41m',
    green: '\x1B[42m',
    yellow: '\x1B[43m',
    blue: '\x1B[44m',
    magenta: '\x1B[45m',
    cyan: '\x1B[46m',
    white: '\x1B[47m',
    gray: '\x1B[100m',
    crimson: '\x1B[48m',
  },
} as const
