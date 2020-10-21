import {camelToKebabCase} from "../dist/function/camel-to-kebab-case";
import {kebabCaseToCamel} from "../dist/function/kebab-case-to-camel";
import {kebabCaseToSnake} from "../dist/function/kebab-case-to-snake";
import {sort} from "../src/function/sort";

test('camelToKebabCase', () => {
    expect(camelToKebabCase('MyFormat')).toBe('my-format');
    expect(camelToKebabCase('myFormat')).toBe('my-format');
    expect(camelToKebabCase('userAccount')).toBe('user-account');
});

test('kebabCaseToCamel', () => {
    expect(kebabCaseToCamel('my-format')).toBe('myFormat');
    expect(kebabCaseToCamel('My-format')).toBe('MyFormat');
    expect(kebabCaseToCamel('user-account')).toBe('userAccount');
});

test('kebabCaseToSnake', () => {
    expect(kebabCaseToSnake('my-format')).toBe('my_format');
    expect(kebabCaseToSnake('My-format')).toBe('My_format');
    expect(kebabCaseToSnake('user-account')).toBe('user_account');
});

test('sort', () => {
    expect(sort(['x','c','a','d'])).toStrictEqual(['a', 'c', 'd', 'x']);
    expect(sort([9,6,8,4,9,0,12])).toStrictEqual([0,4,6,8,9,9,12]);
});


