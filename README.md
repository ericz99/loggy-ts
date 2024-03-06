# Loggy

> Simplify logging in your application

# Installation

```bash
npm install loggy
```

# Features

- Minimal logging library
- Cloud log backup using 
    - [uploadthing](https://uploadthing.com/)
    - ...more to come
- Custom log message format

# Usage

```typescript

import { createLogger, Loggy } from 'loggy'

// You can use either to initialize an instance in 2 ways

// 1. one way
const logger = createLogger({
    path: 'some-path',
    formatMessageTemplate: '😊 ({TIME}) - ({LEVEL}) - >> {MESSAGE}',
    backupDuration: 3600 * 1000 // 1 hour in MS
    logLevelColor: {
        error: {
            color: 'blue',
        },
    },
    shouldBackUp: true,
    cloud: {
        ut: {
            apiKey: '...'
        }
    }
});

// 2. second way
const logger = new Loggy({
    path: 'some-path',
    formatMessageTemplate: '😊 ({TIME}) - ({LEVEL}) - >> {MESSAGE}',
    backupDuration: 3600 * 1000 // 1 hour in MS
    logLevelColor: {
        error: {
            color: 'blue',
        },
    },
    shouldBackUp: true,
    cloud: {
        ut: {
            apiKey: '...'
        }
    }
});

// # list of available logging method

logger.debug('hi this debug');
logger.warn('hello this is warn')
logger.error('hello this is error')
logger.info('hello this is info')
logger.silly('hello this is silly')
logger.custon('hello this is custom')

```

# API Reference

## LoggyOptions

To configure the Cloud Backup Service, users need to provide the following parameters:

- path: The path to the data to be backed up.
- formatMessageTemplate: The template for formatting log messages. Supported placeholders include {TIME}, {LEVEL}, and {MESSAGE}.
- backupDuration: The duration (in milliseconds) between backups. Default is set to 1 hour.
- shouldBackUp: A boolean indicating whether backups should be performed.
- logLevelColor: You can configure your log level color.
- cloud: Configuration for the cloud storage provider.
    - [ut](https://uploadthing.com/): Configuration specific to the cloud provider. Currently, only API key is supported.
        - apiKey: The API key for accessing the cloud storage provider.

## License

[MIT](./LICENSE) License © 2024 [Eric Zhang](https://github.com/ericz99)