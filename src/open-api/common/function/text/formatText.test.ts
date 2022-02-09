/* eslint-disable @typescript-eslint/no-loop-func */
import { FROM_CASE_MAP, TO_CASE_MAP } from './formatText';

describe('format text', () => {
  const TEST_FROM_MAP: Record<keyof typeof FROM_CASE_MAP, Array<{ input: string; result: Array<string> }>> = {
    CamelCase: [
      { input: 'createReactApp', result: ['create', 'React', 'App'] },
      { input: 'CREATE-REACT-APP', result: ['CREATE-REACT-APP'] },
      { input: 'CREATE_REACT_APP', result: ['CREATE_REACT_APP'] },
      { input: 'create-react-app', result: ['create-react-app'] },
      { input: 'create_react_app', result: ['create_react_app'] },
    ],
    PascalCase: [{ input: 'CreateReactApp', result: ['Create', 'React', 'App'] }],
    KebabCase: [
      { input: 'create-react-app', result: ['create', 'react', 'app'] },
      { input: 'CREATE-REACT-APP', result: ['CREATE', 'REACT', 'APP'] },
    ],
    SnakeCase: [
      { input: 'create_react_app', result: ['create', 'react', 'app'] },
      { input: 'CREATE_REACT_APP', result: ['CREATE', 'REACT', 'APP'] },
    ],
    Any: [{ input: 'create_REACT-App', result: ['create', 'REACT', 'App'] }],
  };
  for (const testCaseName of Object.keys(FROM_CASE_MAP)) {
    for (const textCase of TEST_FROM_MAP[testCaseName]) {
      it(`check FROM_CASE_MAP => ${testCaseName} input: '${textCase.input}'`, () => {
        expect(FROM_CASE_MAP[testCaseName](textCase.input)).toStrictEqual(textCase.result);
      });
    }
  }
  const TEST_TO_MAP: Record<keyof typeof TO_CASE_MAP, Array<{ input: Array<string>; result: string }>> = {
    CamelCase: [{ input: ['create', 'React', 'App'], result: 'createReactApp' }],
    PascalCase: [{ input: ['create', 'React', 'App'], result: 'CreateReactApp' }],
    KebabCase: [{ input: ['create', 'React', 'App'], result: 'create-react-app' }],
    SnakeCase: [{ input: ['create', 'React', 'App'], result: 'create_react_app' }],
  };
  for (const testCaseName of Object.keys(TO_CASE_MAP)) {
    for (const textCase of TEST_TO_MAP[testCaseName]) {
      it(`check TO_CASE_MAP => ${testCaseName} input: [ ${textCase.input.map((v) => `'${v}'`).join(', ')} ]`, () => {
        expect(TO_CASE_MAP[testCaseName](textCase.input)).toStrictEqual(textCase.result);
      });
    }
  }
});
