export function getVersion(): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { version } = require('../../package.json');
    return version;
}
