/** @noSelfInFile */
import { OneToManyVisitorResult } from "typescript-to-lua/dist/transformation/utils/lua-ast";
import { Node } from 'typescript-to-lua';
export declare function prepareOneToManyVisitorResult<P extends Node>(rawResult: OneToManyVisitorResult<P>): P[] | undefined;
export declare function getExportsTableName(): string;
export declare function getGlobalsTableName(): string;
