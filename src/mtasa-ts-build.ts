import { CompilerOptions, parseConfigFileWithSystem, transpileFiles } from "typescript-to-lua";
import * as JSON5 from "json5";
import fs from "fs";
import ts from "typescript";

const content = fs.readFileSync("./tsconfig.json", "utf8");
const config = JSON5.parse(content);



const configParseResult = parseConfigFileWithSystem('tsconfig.json');

const compilerOptions: CompilerOptions = {
  ...configParseResult.options
};


const result = transpileFiles(
  ["src/test/resource_example/index.ts"],
  compilerOptions,
  function(fileName, data, writeByteOrderMark, onError, sourceFiles) {
    // TODO:!!!!
  }
);

if (result.diagnostics.length !== 0) {
  for (const diagnostic of result.diagnostics) {
    if (typeof(diagnostic.messageText) === 'string' ) {
      console.error(`Diagnostic error: ${diagnostic.messageText}`);
    } else {
      console.error(`Diagnostic error: ${diagnostic.messageText.messageText}`);
    }
  }

  ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
}

console.log("result", result);