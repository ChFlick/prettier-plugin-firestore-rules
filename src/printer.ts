import { FastPath, Doc, doc } from "prettier";

type PrintFn = (path: FastPath) => Doc;

const {
    concat,
    join,
    hardline
} = doc.builders;

export function print(path: FastPath, _options: object, print: PrintFn): Doc {
    const node: Node = path.getValue();

    if (!node) {
        return '';
    }

    switch (node.type) {
        case "root":
            if (node.version) {
                return join(hardline, [node.version.join(' '), path.call(print, 'service')]);
            }
            return path.call(print, 'service');

        case "service":
            return 'test';
    }

    // throw new Error('Could not find a printer for node type ' + node.type);
}

type Node = RootNode | ServiceNode

type RootNode = {
    type: 'root';
    version?: string[];
    service: object;
}

type ServiceNode = {
    type: 'service';
    head: string[];
    content: object[];
}