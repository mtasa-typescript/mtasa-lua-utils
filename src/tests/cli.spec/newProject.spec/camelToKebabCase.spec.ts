import { camelToKebabCase } from '../../../cli/newProject';

describe('camelToKebabCase case', () => {
    test('correct convertation', () => {
        expect(camelToKebabCase('MyProject')).toEqual('my-project');
        expect(camelToKebabCase('')).toEqual('');
    });
});