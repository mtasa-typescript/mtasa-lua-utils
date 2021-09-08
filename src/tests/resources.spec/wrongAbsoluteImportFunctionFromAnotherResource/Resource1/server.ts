// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { exportedFunction } from 'resources.spec/wrongAbsoluteImportFunctionFromAnotherResource/Resource0/server';
import { mtasa } from 'mtasa-lua-types/types/mtasa/server';

mtasa.iprint(exportedFunction());
