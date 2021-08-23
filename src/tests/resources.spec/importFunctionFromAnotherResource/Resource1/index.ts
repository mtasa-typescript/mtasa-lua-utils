import { anotherResourceFunction } from '../Resource0/indexWithExports';
import { mtasa } from 'mtasa-lua-types/types/mtasa/server';
import { exportedTheSameResource } from './imported';

mtasa.iprint(anotherResourceFunction(), exportedTheSameResource());
