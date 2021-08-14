/** @noSelfInFile */
import { ValidatorResult } from 'jsonschema';
import { MTASAMeta } from './types';
export declare function validateMeta(data: MTASAMeta): ValidatorResult;
export declare function readMeta(filepath: string): MTASAMeta[];
