import { SupportOption } from 'prettier';

declare module 'prettier' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RequiredOptions extends PluginOptions {}
}

export interface PluginOptions {
    emptyLinesBetweenBlocks: number;
}

export const options: Record<keyof PluginOptions, SupportOption> = {
    emptyLinesBetweenBlocks: {
        name: 'emptyLinesBetweenBlocks',
        type: 'int',
        default: 0,
        description: 'Insert empty lines between matcher blocks',
        category: 'firestore-rules',
    }
};