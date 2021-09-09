import { Names, SomeInterface } from '../Resource0/indexWithTypes';
import { mtasa } from 'mtasa-lua-types/client';

const object: SomeInterface = {
    password: '123456',
    id: 123,
    name: Names.NameTwo,
};

mtasa.iprint(object);
