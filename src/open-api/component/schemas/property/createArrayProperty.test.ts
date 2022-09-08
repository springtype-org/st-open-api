import { createArrayProperty } from './createArrayProperty';
import { InterfaceProperty } from '../../../classes/InterfaceProperty';
import { InterfaceArrayProperty } from '../../../classes/InterfaceArrayProperty';
import { Configuration } from '../../../classes/Configuration';
import { Logger, LogLevel } from '../../../classes/Logger';

export const getTestConfiguration = () =>
  new Configuration(
    {
      config: undefined,
      force: false,
      language: 'ts',
      logLevel: 'INFO',
      onlyComponents: false,
      output: '/',
      source: '/',
    },
    new (class TestLogger implements Logger {
      debug(): void {}

      error(): void {}

      getLevel(): LogLevel {
        return 'INFO';
      }

      info(): void {}

      warn(): void {}
    })(),
  );

describe('creat array property', () => {
  it('test with nested object', () => {
    const response = createArrayProperty(
      {
        schemaName: 'Addresses',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            required: ['number'],
            properties: {
              street: {
                maxLength: 128,
                minLength: 0,
                type: 'string',
              },
              number: {
                maxLength: 16,
                minLength: 0,
                type: 'string',
              },
              zip: {
                type: 'number',
              },
            },
          },
        },
        folderPath: '/',
        prefixRefKey: '#/components/schema',
        round: 0,
      },
      getTestConfiguration(),
    );
    expect(response.length).toBe(2);

    const interfaceArrayProperty = response[0] as InterfaceArrayProperty;
    const interfaceProperty = response[1] as InterfaceProperty;

    expect(interfaceArrayProperty).toBeInstanceOf(InterfaceArrayProperty);
    expect(interfaceArrayProperty.interfaceName).toBe('AddressesItem');
    expect(interfaceArrayProperty.refClassName).toBe('Addresses');

    expect(interfaceProperty).toBeInstanceOf(InterfaceProperty);
    expect(interfaceProperty.interfaceName).toBe('Addresses');

    const expectedProperties = ['street', 'number', 'zip'].sort();
    expect(Object.keys(interfaceProperty.properties).sort()).toEqual(expectedProperties);

    expect(interfaceProperty.properties.street.data).toEqual({
      description: [],
      isArray: false,
      isDescription: false,
      propertyName: 'street',
      required: false,
      value: 'string',
    });

    expect(interfaceProperty.properties.number.data).toEqual({
      description: [],
      isArray: false,
      isDescription: false,
      propertyName: 'number',
      required: true,
      value: 'string',
    });

    expect(interfaceProperty.properties.zip.data).toEqual({
      description: [],
      isArray: false,
      isDescription: false,
      propertyName: 'zip',
      required: false,
      value: 'number',
    });
  });

  it('test with primitive type', () => {
    const response = createArrayProperty(
      {
        schemaName: 'Addresses',
        schema: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        folderPath: '/',
        prefixRefKey: '#/components/schema',
        round: 0,
      },
      getTestConfiguration(),
    );
    expect(response.length).toBe(2);
  });

  it('test with $ref', () => {
    const response = createArrayProperty(
      {
        schemaName: 'Addresses',
        schema: {
          type: 'array',
          items: {
            $ref: 'string',
          },
        },
        folderPath: '/',
        prefixRefKey: '#/components/schema',
        round: 0,
      },
      getTestConfiguration(),
    );
    expect(response.length).toBe(1);
  });
});
