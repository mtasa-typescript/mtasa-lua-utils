/** @noSelfInFile */
import ts from 'typescript';
export declare enum ImportTypesSide {
    CLIENT = "CLIENT",
    SERVER = "SERVER"
}
export declare function fileSideDetection(node: ts.Node, props: {
    side: ImportTypesSide | undefined;
}): void;
