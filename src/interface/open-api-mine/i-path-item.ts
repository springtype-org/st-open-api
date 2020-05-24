import {IOperation} from "./i-operation";

export interface IPathItem {

    /**
     * Allows for an external definition of this nodePath item.
     * The referenced structure MUST be in the format of a Path Item Object.
     * In case a Path Item Object field appears both in the defined object
     * and the referenced object, the behavior is undefined.
     */
    '$ref'?: string;

    /**
     * An optional, string summary, intended to apply to all operations in this nodePath.
     */
    summary?: string;

    /**
     * An optional, string description, intended to apply to all operations in this nodePath.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * A definition of a GET operation on this nodePath.
     */
    get?: IOperation;

    /**
     * A definition of a PUT operation on this nodePath.
     */
    put?: IOperation;

    /**
     * A definition of a POST operation on this nodePath.
     */
    post?: IOperation;

    /**
     * A definition of a DELETE operation on this nodePath.
     */
    delete?: IOperation;

    /**
     * A definition of a OPTIONS operation on this nodePath.
     */
    options?: IOperation;

    /**
     * A definition of a HEAD operation on this nodePath.
     */
    head?: IOperation;

    /**
     * A definition of a PATCH operation on this nodePath.
     */
    patch?: IOperation;

    /**
     * A definition of a TRACE operation on this nodePath.
     */
    trace?: IOperation;

    /**
     * An alternative server array to service all operations in this nodePath.
     */
    servers?: [];

    /**
     * A list of parameters that are applicable for all the operations described under this nodePath.
     * These parameters can be overridden at the operation level, but cannot be removed there.
     * The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of
     * a name and location. The list can use the Reference Object to link to parameters that are defined
     * at the OpenAPI Object's components/parameters.
     */
    parameters?: [];
}