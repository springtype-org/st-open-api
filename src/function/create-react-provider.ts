import {GROUP_SERVICE} from "../classes/ref";
import {renderMustache} from "./render-mustache";
import {appendFileSync} from "fs";
import {join} from "path";
import {configuration} from "./config";

export interface IReactProviderMustache {
    services: Array<{
        propertyName: string;
        serviceClassName: string;
    }>
    isImport: boolean;
    imports: Array<string>;
}

export const createReactProvider = () => {
    const folder = configuration.getFolderManager();
    const reference = configuration.getReference();

    const services = reference.getByGroup(GROUP_SERVICE)

    const viewData: IReactProviderMustache = {
        services: services.sort((a,b)=> a.fileName.localeCompare(b.fileName))
            .map(v => ({propertyName: v.fileName, serviceClassName: v.className})),
        isImport: services.length > 0,
        imports: services.map(v => reference.getImportAndTypeByRef(
            v.refKey,
            folder.getReactProviderFolder()).import
        ).sort()
    }

    appendFileSync(
        join(folder.getReactProviderFolder(), `open-api-provider.tsx`),
        renderMustache('react-provider.mustache', viewData)
    )

}
