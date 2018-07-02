/* @flow */

import { Stream, of, from } from 'most';
import type { Observable } from 'most';

import { createSubject, createReplaySubject } from './Subject';
import type { Subject } from './Subject';

export type Case<S, P> = {|
  +state$: Stream<S>,
  next(payload: P): void,
  error(error: Error): void,
  complete(payload: void | P): void,
|};

export type Store<S> = {|
  +state$: Stream<S>,
  case<P>(handler: (state: S, payload: P) => Observable<S> | S): Case<S, P>,
  onState(handler: (state: S) => Observable<S> | S): Case<S, void>,
  onPayload<P>(handler: (payload: P) => Observable<S> | S): Case<S, P>,
  just(): Case<S, S>,
  always(value: S): Case<S, void>,
|};

type CreateStore = <S>(initialState: S) => Store<S>;

export const createStore: CreateStore = <S>(initialState: S): Store<S> => {
  const storeSubject: Subject<S> = createReplaySubject(initialState);
  const state$: Stream<S> = storeSubject.stream.multicast();

  const initCase = <P>(
    handler: (state: S, payload: P) => Observable<S> | S,
  ): Case<S, P> => {
    const { next, error, complete, stream }: Subject<P> = createSubject();

    const case$: Stream<S> = stream
      .sample(handler, state$, stream)
      .chain(
        (value: Observable<S> | S) =>
          value && typeof value.subscribe == 'function'
            ? from(((value: any): Observable<S>))
            : of(((value: any): S)),
      )
      .multicast();

    case$.subscribe(storeSubject);

    return { next, error, complete, state$: case$ };
  };

  return {
    state$,
    case: initCase,

    onState: (handler): Case<S, void> => initCase(state => handler(state)),

    onPayload: <P>(handler: (payload: P) => Observable<S> | S): Case<S, P> =>
      initCase((state, payload) => handler(payload)),

    just: (): Case<S, S> => initCase((_, payload) => payload),

    always: (value): Case<S, void> => initCase(() => value),
  };
};