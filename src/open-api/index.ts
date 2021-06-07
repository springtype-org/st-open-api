import nodeFetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { FormData as NodeFormData, File as NodeFile } from 'formdata-node';
import NodeBlob from 'fetch-blob';

declare global {
  let fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>;
  let FormData: typeof NodeFormData;
  let File: typeof NodeFile;
  let Blob: typeof NodeBlob;
}

declare module globalThis {
  let fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>;
  let FormData: typeof NodeFormData;
  let File: typeof NodeFile;
  let Blob: typeof NodeBlob;
}

if (!globalThis.fetch) {
  globalThis.fetch = nodeFetch;
}

if (!globalThis.FormData) {
  globalThis.FormData = NodeFormData;
}

if (!globalThis.File) {
  globalThis.File = NodeFile;
}
if (!globalThis.Blob) {
  globalThis.Blob = NodeBlob;
}
