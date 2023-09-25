import { createContext, useContext, useEffect, useState } from "react";

/**
 * 要解决context-dispatch带来的state整体变更问题，需要：
 * 1、 自行管理state
 * 2、 发起dispatch时，需要手动引起state变更
 * 3、 并通知依赖了变更的地方进行更新
 * 4、 考虑context的重新载入，将重置回初始状态
 * 
 * 对应关系：
 * Publisher：1 - Context：1 - state：1
 * 
 * 则Publisher作为观察者模式更有利于整体状态管理
 */
export class Publisher<T extends object> {
  state;
  subscribers: { type: keyof T, subscriber: Subscriber<T, keyof T> }[] = [];
  constructor(state: T) {
    // TODO 这里只考虑了state的修改，并没有考虑state的增删
    this.state = state;
    Object.keys(state).forEach(<U extends keyof T>(k: string) => {
      const key = k as U;
      const subscriber = new Subscriber((prevState: T, value: T[U]) => {
        // publisher和state同步更新
        this.state[key] = value;
      });
      this.subscribe(key, subscriber);
    });
  }
  setState<U extends (keyof T)>(nextState: T) {
    // TODO 这里只考虑了state的修改，并没有考虑state的增删
    Object.keys(nextState).forEach((key) => {
      if (
        Object.prototype.hasOwnProperty.call(this.state, key) &&
        !Object.is(this.state[key as U], nextState[key as U])
      ) {
        this.publish(key as U, nextState[key as U]);
      }
    });
  }
  // 这里监听的是state[key]的更改
  subscribe<U extends (keyof T)>(
    type: U,
    subscriber: Subscriber<T, U> | ((prevState: T, value: T[U]) => void)
  ) {
    if (!(subscriber instanceof Subscriber)) {
      subscriber = new Subscriber(subscriber);
    }
    this.subscribers.push({ type, subscriber: subscriber as Subscriber<T, keyof T> });
  }
  unsubscribe<U extends (keyof T)>(sub: Subscriber<T, U>) {
    const index = this.subscribers.findIndex(({ subscriber }) => subscriber === sub);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
  publish<U extends (keyof T)>(type: U, value: T[U]) {
    this.subscribers.forEach((sub) => {
      if (sub.type === type) {
        sub.subscriber.onMessage(this.state, value);
      }
    });
  }
  genReducer<V>(fn: (state: T, action: V) => T) {
    return (state: T, action: V) => {
      const newState = fn(state, action);
      this.setState(newState);
    };
  }
}

// Subscriber与state的key有强绑定关系
class Subscriber<T, U extends keyof T> {
  onMessage: (prevState: T, value: T[U]) => void;
  constructor(fn: (prevState: T, value: T[U]) => void) {
    this.onMessage = fn;
  }
}

const genPubSub = function <
  // state
  T extends Record<string, unknown>,
  // action<key-value>
  V,
>(
  // 将initState记录在publisher内部，用于重复挂载恢复现场
  initState: T,
  publisher: Publisher<T>,
  reducer: (state: T, action: V) => void
) {
  // 生成dispatch
  const dispatch = (action: V) => {
    reducer(publisher.state, action);
  };

  const PubSubContext = createContext({ dispatch });
  const usePubSubContext = () => useContext(PubSubContext);

  // 生成Provider
  const PubSubProvider = (props: { children: React.ReactNode }) => {
    useEffect(() => {
      return () => {
        publisher.setState(initState);
      };
    });
    return (<PubSubContext.Provider value={{ dispatch }}>
      {props.children}
    </PubSubContext.Provider>);
  };

  // 订阅state数据
  const useSubscribe = function <U extends keyof T>(key: U): T[U] {
    const [keyState, setKeyState] = useState(publisher.state[key]);
    useEffect(() => {
      const subscriber = new Subscriber((prevState: T, value: T[U]) => {
        setKeyState(value);
      });
      publisher.subscribe(key, subscriber);
      return () => {
        publisher.unsubscribe(subscriber);
      };
    });
    return keyState;
  };
  return {
    publisher,
    dispatch,
    PubSubProvider,
    usePubSubContext,
    useSubscribe
  };
};

export const createPubSub = function <
  // state
  T extends Record<string, unknown>,
  // action<key-value>
  V,
>(
  initStateParam: T,
  reducerMaker: (publisher: Publisher<T>) =>
    (state: T, action: V) => void
) {
  const initState = { ...initStateParam };
  const publisher = new Publisher(initState);
  // 生成reducer
  const reducer = reducerMaker(publisher);
  return genPubSub(initState, publisher, reducer);
};

export const createPubSubContext = function <
  // state
  T extends Record<string, unknown>,
  // action<key-value>
  V,
>(
  initStateParam: T,
  reducerFn: (state: T, action: V) => T
) {
  const initState = { ...initStateParam };
  const publisher = new Publisher(initState);
  // 生成reducer
  const reducer = publisher.genReducer(reducerFn);
  return genPubSub(initState, publisher, reducer);
};
