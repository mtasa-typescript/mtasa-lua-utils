/** @noSelfInFile */
import { internalConst, internalFunction } from './misc';

export function anotherResourceFunction(): number {
    return 10000 + internalConst.length + internalFunction();
}
