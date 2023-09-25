import { ITriggerState } from "./GlobalTriggerPubSub";
import { Publisher } from "./PubSub";

declare global {
  interface Window {
    dispatch: (action: ACTION_TYPE) => void,
    publisher: Publisher<ITriggerState>
  }
}