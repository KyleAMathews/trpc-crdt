import { AnyRouter } from '@trpc/server';
import { TRPCLink } from '@trpc/client';

type Listener<T> = (value: T) => void;
declare function createElectricRef<T>(): {
    value: T | undefined;
    subscribe(listener: Listener<T>): () => void;
};
declare const link: <TRouter extends AnyRouter>({ electricRef, clientId, }: {
    electricRef: any;
    clientId: string;
}) => TRPCLink<TRouter>;

export { createElectricRef, link };
