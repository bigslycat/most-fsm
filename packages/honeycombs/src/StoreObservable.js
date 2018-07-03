/* @flow */

import $$observable from 'symbol-observable';

import type {
  Subscription,
  ObservableInterface,
  ObserverInterface,
} from 'es-observable';

import { StateSubject } from './StateSubject';
import { SimpleStore, type SimpleStoreLike } from './SimpleStore';

export class StoreObservable<S>
  implements ObservableInterface<S>, SimpleStoreLike<S> {
  #store /* : SimpleStore<S> */;

  #subject /* : StateSubject<S> */;

  constructor(store: SimpleStore<S>, subject: StateSubject<S>) {
    this.#store = store;
    this.#subject = subject;
  }

  getState(): S {
    return this.#store.getState();
  }

  subscribe(
    next: (S => void) | ObserverInterface<S>,
    error?: Error => void,
    complete?: () => void,
  ): Subscription<S> {
    return this.#subject.subscribe((next: any), error, complete);
  }

  /* ::
  +subscribe: ((
    next: (S) => void,
    error?: (Error) => void,
    complete?: () => void,
  ) => Subscription<S>) &
    ((observer: ObserverInterface<S>) => Subscription<S>);
  */

  // $FlowFixMe
  [$$observable]() {
    return this;
  }
}
