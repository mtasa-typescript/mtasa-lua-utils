import ts from 'typescript';

export enum ImportTypesSide {
    CLIENT = 'CLIENT',
    SERVER = 'SERVER',
}

// Checks the file side (server/client) and expects single side imports
// (No server-side and client-side imports mixing)

export function fileSideDetection(
    node: ts.Node,
    props: { side: ImportTypesSide | undefined },
) {
    if (!ts.isImportDeclaration(node)) {
        return;
    }

    node.forEachChild(childNode => {
        if (!ts.isStringLiteral(childNode)) {
            return;
        }

        const filepath = childNode.getText().toLowerCase();
        if (filepath.indexOf('client') !== -1) {
            if (props.side === undefined) {
                props.side = ImportTypesSide.CLIENT;
                return;
            } else if (props.side === ImportTypesSide.SERVER) {
                throw new Error(
                    'Please do not mix client and server side imports',
                );
            }
            return;
        }

        if (filepath.indexOf('server') !== -1) {
            if (props.side === undefined) {
                props.side = ImportTypesSide.SERVER;
                return;
            } else if (props.side === ImportTypesSide.CLIENT) {
                throw new Error(
                    'Please do not mix client and server side imports',
                );
            }
            return;
        }
    });
}
