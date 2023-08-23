import {ISchema} from "../interface/open-api-mine/i-schema";
import {
  IFunctionRequestBodyNonJSON,
  IFunctionRequestBodyOneOf,
  IFunctionRequestBodySingle,
  RequestBodyCardinality,
} from "../classes/object-property";
import {getInterfaceOrEnumFromSchema} from "./get-property";
import {appendFileSync} from "fs";
import {join} from "path";
import {configuration} from "./config";
import {formatText} from "./formatText";

type IRequestBodySchemaSingle = IFunctionRequestBodySingle & {
  import?: string;
};

type IRequestBodySchemaOneOf = IFunctionRequestBodyOneOf & {
  import?: string[];
};

export type RequestBodySchemaInfo =
  | IRequestBodySchemaSingle
  | IRequestBodySchemaOneOf;

export const createRequestBodyInterfaces = (
  operationId: string,
  requestBody: any
): RequestBodySchemaInfo => {
  if (!!requestBody) {
    const content = requestBody.content;

    if (!!content["application/json"]) {
      const requestBody = content["application/json"].schema as ISchema;

      let requestBodyCardinality: RequestBodyCardinality;
      let requestBodySchemaInformation: RequestBodySchemaInfo;
      
      if (!!requestBody.oneOf) {
        requestBodyCardinality = "oneOf";
        requestBodySchemaInformation = createMultipleRequestBodyInterfaces(
          operationId,
          requestBody
        );
      } else {
        requestBodyCardinality = "single";
        requestBodySchemaInformation = createSingleRequestBodyInterface(
          operationId,
          requestBody
        );
      }

      return {
        isRequestBodyJson: true,
        requestBodyCardinality,
        ...requestBodySchemaInformation,
      };
    }
  }
  return {
    isRequestBodyJson: false,
  } as IFunctionRequestBodyNonJSON;
};

const createSingleRequestBodyInterface = (
  operationId: string,
  requestBody: any
): RequestBodySchemaInfo => {
  const requestBodySchemaInformation = extractRequestBodySchemaInfo(
    operationId,
    requestBody
  );

  return {
    ...requestBodySchemaInformation,
    isRequestBodyJson: true,
    requestBodyCardinality: "single",
  };
};

const createMultipleRequestBodyInterfaces = (
  operationId: string,
  requestBody: any
): RequestBodySchemaInfo => {
  const initialReducerValue: {
    requestBodyClass: string[];
    import: string[];
  } = {
    requestBodyClass: [],
    import: [],
  };

  const requestBodySchemaInformation = requestBody.oneOf
    .map((oneOfSchema: any) => {
      return extractRequestBodySchemaInfo(operationId, oneOfSchema);
    })
    .reduce((prev, curr) => {
      return {
        requestBodyClass: [...prev.requestBodyClass, curr.requestBodyClass],
        import: [...prev.import, curr.import],
      };
    }, initialReducerValue);

  return {
    ...requestBodySchemaInformation,
    isRequestBodyJson: true,
    requestBodyCardinality: "oneOf",
  };
};

type RequestBodyClassAndImport = IFunctionRequestBodySingle & {
  import: string;
};

const extractRequestBodySchemaInfo = (
  operationId: string,
  requestBody: any
): Pick<RequestBodyClassAndImport, "requestBodyClass" | "import"> => {
  const reference = configuration.getReference();
  const folder = configuration.getFolderManager();

  let responseType = "string";
  let _import: string;

  if (!!requestBody.$ref) {
    const importAndType = reference.getImportAndTypeByRef(
      requestBody.$ref,
      folder.getServiceFolder()
    );
    responseType = importAndType.className;
    _import = importAndType.import;
  } else {
    // Schema is defined inline, so create a separate schema for it
    const schemaName = `${operationId}Request`;
    const className = "I" + formatText(schemaName, "ANY", "PascalCase");
    let interfaceOrEnumeration = getInterfaceOrEnumFromSchema(
      className,
      schemaName,
      requestBody,
      folder.getInterfaceRequestFolder()
    );

    if (!!interfaceOrEnumeration) {
      const rendered = interfaceOrEnumeration.render();
      appendFileSync(
        join(folder.getInterfaceRequestFolder(), `${rendered.fileName}.ts`),
        rendered.render
      );
      _import = interfaceOrEnumeration.fileName;
      const refKey = `#/components/schemas/response/${schemaName}`;
      reference.addReference(refKey, {
        fileName: interfaceOrEnumeration.fileName,
        className: className,
        folderPath: folder.getInterfaceRequestFolder(),
      });
      const importAndType = reference.getImportAndTypeByRef(
        refKey,
        folder.getServiceFolder()
      );

      responseType = importAndType.className;
      _import = importAndType.import;
    }
  }
  return {
    import: _import,
    requestBodyClass: responseType,
  };
};
