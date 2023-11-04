import { AnyRouter } from '@trpc/server';
import { Doc } from 'yjs';
import { TRPCLink } from '@trpc/client';

declare const link: <TRouter extends AnyRouter>({ doc, }: {
    doc: Doc;
}) => TRPCLink<TRouter>;

export { link };
