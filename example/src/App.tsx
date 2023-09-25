import { MainWithContext } from "./GlobalTriggerContextDispatch";
import { MainPubSub } from "./GlobalTriggerPubSub";

export const App = () => {
  return (<div>
    <MainWithContext></MainWithContext>
    <hr />
    <MainPubSub></MainPubSub>
  </div>);
};
