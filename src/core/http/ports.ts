export type HttpBody = string | Blob | ArrayBuffer;

export interface IHttp {
  get(
    url: string,
    options?: RequestInit,
    timeoutMs?: number,
  ): Promise<Response>;
  post(
    url: string,
    body: HttpBody,
    options?: RequestInit,
    timeoutMs?: number,
  ): Promise<Response>;
}
