/* @flow */

import type { ObservableInterface } from 'es-observable';

import { StoreObservable } from './StoreObservable';
// eslint-disable-next-line no-unused-vars
import { StateSubject } from './StateSubject';
import { SimpleStore } from './SimpleStore';
import { Case } from './Case';

class Store<S> extends StoreObservable<S> implements ObservableInterface<S> {
  #store /* : SimpleStore<S> */;

  #subject /* : StateSubject<S> */;

  constructor(initialState: S) {
    const store = SimpleStore.of(initialState);
    super(store);
  }

  case<P>(handler: (state: S, payload: P) => S): Case<S, P> {
    return Case.from(this.#store, this.#subject, handler);
  }

  payload<P>(handler: (payload: P) => S): Case<S, P> {
    return Case.payload(this.#store, this.#subject, handler);
  }

  always(payload: S): Case<S, void> {
    return Case.always(this.#store, this.#subject, payload);
  }

  just(): Case<S, S> {
    return Case.just(this.#store, this.#subject);
  }
}

export type { Store };

export function of<T>(initialState: T): Store<T> {
  return new Store(initialState);
}