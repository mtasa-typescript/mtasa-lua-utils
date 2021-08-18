/// <reference types='typescript-to-lua/language-extensions' />

import { mtasa as mtasaNew } from 'mtasa-lua-types/types/mtasa/client';
import { tempFunction, variable } from './imported';
import * as imp from './imported';
import { tempFunction as namedTempFunction } from './imported';
import testFunction from './imported';
import { isTransferBoxVisible } from 'mtasa-lua-types/types/mtasa/client/function/server';
import { setTransferBoxVisible } from 'mtasa-lua-types/types/mtasa/client/function/server';

tempFunction(variable);
namedTempFunction(variable);
imp.tempFunction(variable);
testFunction();

isTransferBoxVisible();
mtasaNew.setTransferBoxVisible(true);

function something() {
    return 1;
}
