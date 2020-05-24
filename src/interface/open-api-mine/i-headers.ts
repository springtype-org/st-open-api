import {IHeader} from "./i-header";
import {IReference} from "./i-reference";

export interface IHeaders {
    [name: string]: IHeader | IReference;
}