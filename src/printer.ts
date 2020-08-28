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
        case 'root': {
            return join(hardline, path.map(print, 'content'));
        }

        case 'version': {
            const version: Doc[] = [
                `rules_version = '`,
                node.version,
                `';`,
            ];

            if (node.comment) {
                version.push(' ');
                version.push(`// ${node.comment}`);
            }

            return group(concat(version));
        }

        case 'service': {
            const head = join(' ',
                node.comment ?
                    [...node.head, '{', `// ${node.comment}`] :
                    [...node.head, '{']
            );

            return concat([
                group(head),
                indent(
                    concat([
                        hardline,
                        join(hardline, path.map(print, 'content'))
                    ])
                ),
                hardline,
                '}'
            ]);
        }

        case 'match': {
            const head = join(' ',
                node.comment ?
                    ['match', node.path, '{', `// ${node.comment}`] :
                    ['match', node.path, '{']
            );

            return concat([
                group(
                    head
                ),
                indent(
                    concat([
                        hardline,
                        join(hardline, path.map(print, 'content'))
                    ])
                ),
                hardline,
                '}'
            ]);
        }

        case 'allow': {
            const afterAllowScope = node.scopesComment ? [` // ${node.scopesComment}`, hardline] : [line];
            if(!node.content) {
                return group(
                    concat([
                        'allow',
                        ' ',
                        join(', ', node.scopes),
                        ';',
                        ...afterAllowScope,
                    ])
                ); 
            }

            return group(
                concat([
                    'allow',
                    ' ',
                    join(', ', node.scopes),
                    ':',
                    ...afterAllowScope,
                    'if',
                    ' ',
                    indent(join(hardline, path.map(print, 'content'))),
                    ';',
                ])
            );
        }

        case 'function-declaration': {
            const params = !node.params ? '()' : group(
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
            );

            return concat([
                'function',
                ' ',
                node.name,
                params,
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
        }

        case 'function-call': {
            const params = !node.params ? '' :
                indent(
                    join(
                        concat([',', line]),
                        path.map(print, 'params')
                    )
                );
            return concat([
                node.name,
                group(
                    concat([
                        '(',
                        softline,
                        params,
                        softline,
                        ')'
                    ])
                )
            ]);
        }

        case 'variable-declaration':
            return group(concat([
                'let',
                ' ',
                node.name,
                ' =',
                line,
                join('.', path.map(print, 'content')),
                ';'
            ]));

        case 'return':
            return group(concat([
                'return',
                line,
                join('.', path.map(print, 'content')),
                ';'
            ]));

        case 'operation':
            return join(' ', [
                join('.', path.map(print, 'left')),
                node.operation,
                join('.', path.map(print, 'right'))
            ]);

        case 'call':
            return concat([
                path.call(print, 'left'),
                '.',
                path.call(print, 'right')
            ]);

        case 'connection':
            return group(concat([
                node.operator,
                ' ',
                ...path.map(print, 'content'),
                softline,
            ]));

        case 'comment':
            return concat([
                '// ',
                node.text
            ]);

        case 'comments': {
            const comments = node.comments.map(comment => '// ' + comment);
            return join(hardline, comments);
        }

        case 'text':
            return node.text;
    }

    // throw new Error('Could not find a printer for node type ' + node.type);
}

type Node = RootNode | VersionNode | ServiceNode | MatcherNode | AllowNode |
    FunctionDeclarationNode | FunctionCallNode | ReturnNode |
    OperationNode | CallNode | TextNode | ConnectionNode |
    VariableDeclarationNode | CommentNode | CommentsNode;

type RootNode = {
    type: 'root';
    content: (VersionNode | ServiceNode | FunctionDeclarationNode | CommentsNode)[];
}

type VersionNode = {
    type: 'version';
    version: string;
    comment: string | null;
}

type ServiceNode = {
    type: 'service';
    head: string[];
    content: Record<string, unknown>[];
    comment: string | null;
}

type MatcherNode = {
    type: 'match';
    path: string;
    content: Record<string, unknown>[];
    comment: string | null;
}

type AllowNode = {
    type: 'allow';
    scopes: string[];
    content?: string[];
    scopesComment: string | null;
}

type FunctionDeclarationNode = {
    type: 'function-declaration';
    name: string;
    params: string[];
    content: Record<string, unknown>[];
}

type FunctionCallNode = {
    type: 'function-call';
    name: string;
    params: string[];
}

type ReturnNode = {
    type: 'return';
    content: Record<string, unknown>[];
}

type OperationNode = {
    type: 'operation';
    left: Record<string, unknown>[];
    operation: string;
    right: Record<string, unknown>[];
}

type CallNode = {
    type: 'call';
    left: Record<string, unknown>;
    right: Record<string, unknown>;
}

type TextNode = {
    type: 'text';
    text: string;
}

type ConnectionNode = {
    type: 'connection';
    operator: string;
    content: Record<string, unknown>[];
}

type VariableDeclarationNode = {
    type: 'variable-declaration';
    name: string;
    content: Record<string, unknown>[];
}

type CommentNode = {
    type: 'comment';
    text: string;
}

type CommentsNode = {
    type: 'comments';
    comments: string[];
}
