import { Parser, Plugin } from 'prettier';
import { parse } from './parser/parser';
import { print } from './printer';

const p: Parser = {
    parse,
    astFormat: 'firestore-ast',
    locStart: (node: any) => {
        console.log('locStart', node);
        return 0;
    },
    locEnd: (node: any) => {
        console.log('locEnd', node);
        return 3;
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

const plugin: Plugin = {
    languages,
    parsers,
    printers,
};