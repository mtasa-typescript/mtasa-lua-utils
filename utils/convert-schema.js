// eslint-disable-next-line @typescript-eslint/no-var-requires
const schemaConverter = require('json-schema-to-typescript');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

// compile from file
schemaConverter
    .compileFromFile('mtasa-meta.schema.json')
    .then(ts => fs.writeFileSync('src/compiler/meta/types.ts', ts));
