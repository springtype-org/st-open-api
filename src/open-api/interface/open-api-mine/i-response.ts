import { IMediaTypes } from './i-media-types';

export interface IResponse {
  /**
   * A brief description of the request body. This could contain examples of use.
   * CommonMark syntax MAY be used for rich text representation.
   */
  description: string;

  /**
   * REQUIRED. The content of the request body. The key is a media type or media type range
   * and the value describes it. For requests that match multiple keys, only the most specific key
   * is applicable. e.g. text/plain overrides text/*
   */
  content: IMediaTypes;
}
