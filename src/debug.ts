import { buildProject } from './cli/build';

const filepath = 'src/tests/resources.spec/importPlugin/mtasa-meta.yml'
buildProject(['--meta', filepath, '--project', 'src/tests/tsconfig.json'])