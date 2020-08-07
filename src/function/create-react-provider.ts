import {IGenerateConfig} from "../interface/i-generate-config";
import {GROUP_SERVICE} from "../classes/ref";
import {renderMustache} from "./render-mustache";
import {appendFileSync} from "fs";
import {join} from "path";

export interface IReactProviderMustache {
    services: Array<{
        propertyName: string;
        serviceClassName: string;
    }>
    isImport: boolean;
    imports: Array<string>;
}

export const createReactProvider = (config: IGenerateConfig) => {
    const {folder, ref} = config;
    const services = ref.getByGroup(GROUP_SERVICE)

    const viewData: IReactProviderMustache = {
        services: services.map(v => ({propertyName: v.fileName, serviceClassName: v.className})),
        isImport: services.length > 0,
        imports: services.map(v => ref.getImportAndTypeByRef(v.refKey, folder.getReactProviderFolder()).import)
    }

    appendFileSync(
        join(folder.getReactProviderFolder(), `open-api-provider.tsx`),
        renderMustache('react-provider.mustache', viewData)
    )

}
