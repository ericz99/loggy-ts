import { request as req } from 'undici'

export type UTApiEndpoint = '/api/deleteFiles' | '/api/uploadFiles' | '/api/getFileUrl'

export interface RequestOptions<T extends UTApiEndpoint> {
  method?: 'POST'
  headers: Record<string, string>
  body: T extends '/api/uploadFiles'
    ? UploadFilesBody
    : T extends '/api/deleteFiles'
      ? DeleteFilesBody
      : T extends '/api/getFileUrl'
        ? GetFileUrlBody
        : never

}

export interface UploadFilesBody {
  name: string
  size: number
  type: string
  customId: string
}

export interface DeleteFilesBody {
  fileKeys: string[]
}

export interface GetFileUrlBody {
  fileKeys: string[]
}

export const utApiRequest = async <T extends UTApiEndpoint>(url: T, options?: RequestOptions<T>) => {
  let _options = {}

  // # only if option exist, add all request options
  if (options) {
    const { method, body, headers } = options

    _options = {
      ...options,
      method,
      body,
      headers,
    }
  }

  const resp = await req(url, _options)
  return resp
}
