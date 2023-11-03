import * as Y from 'yjs';
import { AnyRouter } from '@trpc/server';

interface OnErrorParams {
    error: Error;
    path: string;
    type: string;
    ctx: any;
    input: any;
}
interface AdapterArgs {
    appRouter: AnyRouter;
    context: {
        doc: Y.Doc;
    };
    onError?: (params: OnErrorParams) => void;
}
declare function adapter({ appRouter, context, onError }: AdapterArgs): void;

export { adapter };
