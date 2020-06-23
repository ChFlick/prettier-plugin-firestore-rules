import { Parser, Plugin } from 'prettier';
import { parse } from './parser/parser';
import { print } from './printer';

const p: Parser = {
    parse,
    astFormat: 'firestore-ast',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locStart: (node: any) => {
        console.log('locStart', node);
        return 0;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locEnd: (node: any) => {
        console.log('locEnd', node);
        return 0;
    },
};

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
};

export const plugin: Plugin = {
    languages,
    parsers,
    printers,
};