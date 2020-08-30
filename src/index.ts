import { SupportLanguage, Parser, Printer, Plugin } from 'prettier';
import { parse } from './parser/parser';
import { print } from './printer';

const p: Parser = {
    parse,
    astFormat: 'firestore',
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

export const languages: SupportLanguage[] = [
    {
        name: 'firestore',
        parsers: ['firestore'],
        extensions: ['.rules'],
        vscodeLanguageIds: ['firestorerules'],
    }
];

export const parsers: Record<string, Parser> = {
    firestore: p
};

export const printers: Record<string, Printer> = {
    'firestore': {
        print
    }
};

export const plugin: Plugin = {
    languages,
    parsers,
    printers,
};

export { options } from './options';
