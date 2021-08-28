export const enum CLI_ENQUIRER_KEY {
    DOWN = '\x1B\x5B\x42',
    UP = '\x1B\x5B\x41',
    ENTER = '\x0D',
    SPACE = '\x20',
}

export function getStdinContentForNewProjectCommand(
    projectName: string,
): string[] {
    return [
        projectName,
        CLI_ENQUIRER_KEY.ENTER,
        CLI_ENQUIRER_KEY.ENTER,
        CLI_ENQUIRER_KEY.ENTER,
        CLI_ENQUIRER_KEY.ENTER,
    ];
}

export function getStdinContentForNewProjectCommandNoExample(
    projectName: string,
): string[] {
    return [
        projectName,
        CLI_ENQUIRER_KEY.ENTER,
        CLI_ENQUIRER_KEY.ENTER,
        CLI_ENQUIRER_KEY.DOWN,
        CLI_ENQUIRER_KEY.DOWN,
        CLI_ENQUIRER_KEY.DOWN,
        CLI_ENQUIRER_KEY.SPACE,
        CLI_ENQUIRER_KEY.ENTER,
        CLI_ENQUIRER_KEY.ENTER,
    ];
}
