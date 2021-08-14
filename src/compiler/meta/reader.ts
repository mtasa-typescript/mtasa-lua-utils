import fs from 'fs';
import * as yaml from 'js-yaml';
import { Validator, ValidatorResult } from 'jsonschema';
import { MTASAMeta } from './types';
import * as JSON5 from 'json5';

class MetaReaderError extends Error {}

export function validateMeta(data: MTASAMeta): ValidatorResult {
    const schemaContent = fs.readFileSync('mtasa-meta.schema.json', 'utf8');
    const schema = JSON5.parse(schemaContent);

    const validator = new Validator();
    return validator.validate(data, schema, {
        throwError: false,
    });
}

export function readMeta(filepath: string): MTASAMeta[] {
    const content = fs.readFileSync(filepath, 'utf8');
    const metaArray = yaml.loadAll(content) as MTASAMeta[];

    for (let i = 0; i < metaArray.length; ++i) {
        const meta = metaArray[i];

        const validationResult = validateMeta(meta);
        if (validationResult.errors.length > 0) {
            console.log(
                `Error happen while validating "${filepath}". In part: ${i}`,
            );
            throw new MetaReaderError(validationResult.toString());
        }
    }

    return metaArray;
}
