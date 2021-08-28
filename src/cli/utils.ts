import Enquirer from 'enquirer';
import * as fs from "fs";

export type EnquirerArrayPromptOptions = Extract<
    Parameters<typeof Enquirer.prompt>[0],
    { choices: unknown }
>;

export type EnquirerPromptOptions = Extract<
    Parameters<typeof Enquirer.prompt>[0],
    { type: string | (() => string) }
>;

export type EnquirerPromptOptionsExtended = EnquirerPromptOptions & {
    prefix: string;
};

export interface EnquirerMultiSelectPromptOptions
    extends EnquirerArrayPromptOptions {
    type: 'multiselect';
    choices: string[] | EnquirerChoiceExtended[];
    // Ok, I cannot union
    initial: EnquirerArrayPromptOptions['initial'] & number[];
    result: EnquirerArrayPromptOptions['result'] &
        ((
            this: { map: (v: readonly string[]) => Record<string, string> },
            result: string[],
        ) => string[]);
}

type EnquirerChoices = Exclude<EnquirerArrayPromptOptions['choices'], string[]>;
export type EnquirerChoice = EnquirerChoices[0];

export interface EnquirerChoiceExtended extends EnquirerChoice {
    enabled?: boolean;
    indicator?:
        | string
        | ((
              self: unknown,
              choice: EnquirerChoiceExtended,
              index: number,
          ) => string);
}

// See https://geedew.com/remove-a-directory-that-is-not-empty-in-nodejs/
export function deleteFolderSyncRecursive(path: string):void {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file){
            const curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderSyncRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
