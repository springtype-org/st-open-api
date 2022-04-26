import { IExternalDocumentation } from './i-external-documentation';
import { ITag } from './i-tag';
import { IServer } from './i-server';
import { IParameter } from './i-parameter';
import { IReference } from './i-reference';
import { IRequestBody } from './i-request-body';

export interface IOperation {
  /**
   * A list of tags for API documentation control. Tags can be used for logical grouping of
   * operations by resources or any other qualifier.
   */
  tags?: Array<ITag>;

  /**
   * A short summary of what the operation does.
   */
  summary?: string;

  /**
     * A verbose explanation of the operation behavior. CommonMark syntax MAY be used for
     * rich text representation.

     */
  description?: string;

  /**
   * Additional external documentation for this operation.
   */
  externalDocs?: IExternalDocumentation;

  /**
   * Unique string used to identify the operation. The id MUST be unique among all operations
   * described in the API. The operationId value is case-sensitive. Tools and libraries MAY use
   * the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow
   * common programming naming conventions.
   */
  operationId?: string;

  /**
   * A list of parameters that are applicable for this operation.
   * If a parameter is already defined at the Path Item, the new definition will override it but can
   * never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined
   * by a combination of a name and location. The list can use the Reference Object to link
   * to parameters that are defined at the OpenAPI Object's components/parameters.
   */
  parameters?: Array<IParameter | { $ref: string }>;

  /**
   * The request body applicable for this operation. The requestBody is only supported in HTTP methods
   * where the HTTP 1.1 specification RFC7231 has explicitly defined semantics for request bodies.
   * In other cases where the HTTP spec is vague, requestBody SHALL be ignored by consumers.
   */
  requestBody?: IRequestBody | IReference;

  /**
   * REQUIRED. The list of possible responses as they are returned from executing this operation.
   */
  responses: {};

  /**
   * A map of possible out-of band callbacks related to the parent operation.
   * The key is a unique identifier for the Callback Object. Each value in the map is a Callback Object
   * that describes a request that may be initiated by the API provider and the expected responses.
   */
  callbacks?: {};

  /**
   * Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the
   * declared operation. Default value is false.
   */
  deprecated?: boolean;

  /**
   * A declaration of which security mechanisms can be used for this operation.
   * The list of values includes alternative security requirement objects that can be used.
   * Only one of the security requirement objects need to be satisfied to authorize a request.
   * To make security optional, an empty security requirement ({}) can be included in the array.
   * This definition overrides any declared top-level security. To remove a top-level security
   * declaration, an empty array can be used.
   */
  security?: [];

  /**
   * An alternative server array to service this operation.
   * If an alternative server object is specified at the Path Item Object or Root level,
   * it will be overridden by this value.
   */
  servers?: Array<IServer>;
}
