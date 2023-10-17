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
    doc: Y.Doc;
    appRouter: AnyRouter;
    context: any;
    onError?: (params: OnErrorParams) => void;
}
declare function adapter({ doc, appRouter, context, onError }: AdapterArgs): void;

export { adapter };
