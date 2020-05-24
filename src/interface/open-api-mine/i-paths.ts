import {IPathItem} from "./i-path-item";

export interface IPaths {
    /**
     * A relative nodePath to an individual endpoint. The field name MUST begin with a forward slash (/).
     * The nodePath is appended (no relative URL resolution) to the expanded URL from the Server
     * Object's url field in order to construct the full URL. Path templating is allowed.
     * When matching URLs, concrete (non-templated) paths would be matched before their templated
     * counterparts. Templated paths with the same hierarchy but different templated names MUST NOT
     * exist as they are identical. In case of ambiguous matching, it's up to the tooling to decide
     * which one to use.
     */
    [path: string]: IPathItem
}