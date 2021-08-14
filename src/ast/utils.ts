import { createExportsIdentifier, OneToManyVisitorResult } from "typescript-to-lua/dist/transformation/utils/lua-ast";
import { Node } from 'typescript-to-lua';

export function prepareOneToManyVisitorResult<P extends Node>(
    rawResult: OneToManyVisitorResult<P>,
): P[] | undefined {
    if (rawResult === undefined) {
        return rawResult;
    }

    if (Array.isArray(rawResult)) {
        return rawResult;
    }

    return [rawResult];
}

export function getExportsTableName(): string {
    return createExportsIdentifier().text;
}

export function getGlobalsTableName(): string {
    return '_G'
}