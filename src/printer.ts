import { FastPath, Doc, doc, ParserOptions } from 'prettier';

type PrintFn = (path: FastPath) => Doc;

const {
    concat,
    group,
    hardline,
    indent,
    join,
    line,
} = doc.builders;

export function print(path: FastPath, _options: ParserOptions, print: PrintFn): Doc {
    const node: Node = path.getValue();

    if (!node) {
        return '';
    }

    switch (node.type) {
        case 'root':
            if (node.version) {
                return concat([node.version.join(' '), hardline, path.call(print, 'service')]);
            }
            return path.call(print, 'service');

        case 'service':
            return concat([
                join(' ', [...node.head, '{']),
                hardline,
                indent(
                    join(hardline, path.map(print, 'content'))
                ),
                hardline,
                '}'
            ]);

        case 'match':
            return concat([
                join(' ', ['match', node.path, '{']),
                hardline,
                indent(
                    join(hardline, path.map(print, 'content'))
                ),
                hardline,
                '}'
            ]);

        case 'allow':
            return concat([
                'allow',
                ' ',
                join(', ', node.scopes),
                ':',
                line,
                'if',
                ' ',
                // join(hardline, path.map(print, 'content')),
                ';',
            ]);

        case 'function-declaration':
            return concat([
                'fuction',
                ' ',
                node.name,
                ' ',
                group(
                    concat([
                        '(',
                        line,
                        indent(
                            join(
                                concat([', ', line]),
                                node.params
                            )
                        ),
                        line,
                        ')'
                    ])
                ),
                ' {',
                hardline,
                indent(
                    join(hardline, path.map(print, 'content'))
                ),
                hardline,
                '}'
            ]);
    }

    // throw new Error('Could not find a printer for node type ' + node.type);
}

type Node = RootNode | ServiceNode | MatcherNode | AllowNode | FunctionDeclarationNode

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

type MatcherNode = {
    type: 'match';
    path: string;
    content: object[];
}

type AllowNode = {
    type: 'allow';
    scopes: string[];
    content: string[];
}

type FunctionDeclarationNode = {
    type: 'function-declaration';
    name: string;
    params: string[];
    content: object[];
}