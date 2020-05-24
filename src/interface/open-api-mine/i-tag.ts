import {IExternalDocumentation} from "./i-external-documentation";

export interface ITag {
    /**
     * REQUIRED. The name of the tag.
     */
    name: string;

    /**
     * A short description for the tag. CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * Additional external documentation.
     */
    externalDocs?: IExternalDocumentation;

}