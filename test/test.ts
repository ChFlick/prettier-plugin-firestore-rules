import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from '../out/parser/parser';

// Smoke test
it('can format basic rules', () => {
    const result: any = parse(readFileSync(resolve(__dirname + "/../example.rules")).toString());

    console.log(result)
});