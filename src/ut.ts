import { request as req } from 'undici'

export type UTApiEndpoint = '/api/deleteFiles' | '/api/uploadFiles' | '/api/getFileUrl' | '/api/listFiles'

export interface RequestOptions<T extends UTApiEndpoint> {
  method?: 'POST'
  headers?: Record<string, string>
  body?: T extends '/api/uploadFiles'
    ? UploadFilesBody
    : T extends '/api/deleteFiles'
      ? DeleteFilesBody
      : T extends '/api/listFiles'
        ? ListFilesBody
        : T extends '/api/getFileUrl'
          ? GetFileUrlBody
          : never

}

export interface UploadFilesBody {
  files: {
    name: string
    size: number
    type: string
    customId?: string
  }[]
  metadata: Record<string, string>
  contentDisposition: 'inline'
}

export interface DeleteFilesBody {
  fileKeys: string[]
}

export interface GetFileUrlBody {
  fileKeys: string[]
}

export interface ListFilesBody {
  limit?: number
  offset?: number
}

export const utApiRequest = async <T extends UTApiEndpoint>(url: T, options?: RequestOptions<T>) => {
  let _options = {}
  const _baseUrl = 'https://uploadthing.com'

  // # only if option exist, add all request options
  if (options) {
    const { method, body, headers } = options

    _options = {
      ...options,
      method,
      body: JSON.stringify(body),
      headers,
    }
  }

  const resp = await req(_baseUrl + url, {
    ..._options,
    method: 'POST',
  })

  return resp
}
