import { FastPath, Doc, doc, ParserOptions } from 'prettier';

type PrintFn = (path: FastPath) => Doc;

const {
    concat,
    group,
    hardline,
    indent,
    join,
    line,
    softline
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
                group(join(' ', [...node.head, '{'])),
                indent(
                    concat([
                        hardline,
                        join(hardline, path.map(print, 'content'))
                    ])
                ),
                hardline,
                '}'
            ]);

        case 'match':
            return concat([
                join(' ', ['match', node.path, '{']),
                indent(
                    concat([
                        hardline,
                        join(hardline, path.map(print, 'content'))
                    ])
                ),
                hardline,
                '}'
            ]);

        case 'allow':
            return group(
                concat([
                    'allow',
                    ' ',
                    join(', ', node.scopes),
                    ':',
                    line,
                    'if',
                    ' ',
                    join(hardline, path.map(print, 'content')),
                    ';',
                ])
            );

        case 'function-declaration':
            return concat([
                'function',
                ' ',
                node.name,
                group(
                    concat([
                        '(',
                        softline,
                        indent(
                            join(
                                concat([',', line]),
                                node.params
                            )
                        ),
                        softline,
                        ')'
                    ])
                ),
                ' {',
                indent(
                    concat([
                        hardline,
                        join(hardline, path.map(print, 'content'))
                    ])
                ),
                hardline,
                '}'
            ]);
        case 'function-call':
            return concat([
                node.name,
                group(
                    concat([
                        '(',
                        softline,
                        indent(
                            join(
                                concat([', ', line]),
                                path.map(print, 'params')
                            )
                        ),
                        softline,
                        ')'
                    ])
                )
            ]);
        case 'return':
            return group(concat([
                'return',
                line,
                join('.', path.map(print, 'content'))
            ]));
        case 'operation':
            return join(' ', [
                path.call(print, 'left'),
                node.operation,
                path.call(print, 'right')
            ]);
        case 'text':
            return node.text;
    }

    // throw new Error('Could not find a printer for node type ' + node.type);
}

type Node = RootNode | ServiceNode | MatcherNode | AllowNode |
    FunctionDeclarationNode | FunctionCallNode | ReturnNode | OperationNode |
    TextNode;

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

type FunctionCallNode = {
    type: 'function-call';
    name: string;
    params: string[];
}

type ReturnNode = {
    type: 'return';
    content: object[];
}

type OperationNode = {
    type: 'operation';
    left: string;
    operation: string;
    right: string;
}

type TextNode = {
    type: 'text';
    text: string;
}