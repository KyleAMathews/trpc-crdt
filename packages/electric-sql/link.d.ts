import { AnyRouter } from '@trpc/server';
import { TRPCLink } from '@trpc/client';

declare const link: <TRouter extends AnyRouter>({ electric, clientId, }: {
    electric: any;
    clientId: string;
}) => TRPCLink<TRouter>;

export { link };
