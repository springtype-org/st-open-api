import {IExample} from "./i-example";
import {IReference} from "./i-reference";

export interface IExamples {
    [name: string]: IExample| IReference;
}