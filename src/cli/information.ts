export function getVersion(): string {
    const { version } = require('../../package.json');
    return version;
}
