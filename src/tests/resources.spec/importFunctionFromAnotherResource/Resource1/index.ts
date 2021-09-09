import { anotherResourceFunction } from '../Resource0/indexWithExports';
import { mtasa } from 'mtasa-lua-types/server';
import { exportedTheSameResource } from './imported';

mtasa.iprint(anotherResourceFunction(), exportedTheSameResource());
