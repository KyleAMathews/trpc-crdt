import { AnyRouter } from '@trpc/server';

interface OnErrorParams {
    error: Error;
    path: string;
    type: string;
    ctx: any;
    input: any;
}
interface AdapterArgs {
    db: any;
    appRouter: AnyRouter;
    context: any;
    onError?: (params: OnErrorParams) => void;
}
declare function adapter({ appRouter, context, onError }: AdapterArgs): Promise<void>;

export { adapter };
