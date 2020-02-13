import { Doc, FastPath, Parser, Plugin } from 'prettier';
import { parse } from './parser/parser';

function print(_path: FastPath, _options: object, _print: (path: FastPath) => Doc): Doc {
    return 'nothing happening yet...';
}

const p: Parser = {
    parse: (text: string) => parse(text),
    astFormat: 'firestore-ast',
    locStart: (node: any) => {
        console.log('locStart', node);
        return 0;
    },
    locEnd: (node: any) => {
        console.log('locEnd', node);
        return 3;
    },
}

export const languages = [
    {
        // The language name
        name: 'firestore',
        // Parsers that can parse this language.
        // This can be built-in parsers, or parsers you have contributed via this plugin.
        parsers: ['firestore']
    }
];

export const parsers = {
    firestore: p
};

export const printers = {
    'firestore-ast': {
        print
    }
}

const plugin: Plugin = {
    languages,
    parsers,
    printers,
}