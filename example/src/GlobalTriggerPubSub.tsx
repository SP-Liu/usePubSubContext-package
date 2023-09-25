import { useRef } from "react";
import { createPubSubContext } from "use-pubsub-context";

/**
 * 例子：假如当前是一个视频播放页面，配置背景色、音量、播放速度等
 */

export interface ITriggerState extends Record<string, unknown> {
  theme: string,
  musicVolume: string,
  speed: string,
}

// 基础配置
const initTriggerState: ITriggerState = {
  theme: 'dark',
  musicVolume: 'mute',
  speed: '1',
};

export type ACTION_TYPE = { type: string, value?: unknown }
  & { type: 'TOGGLE_MUTE' }
  | { type: 'THEME_CHANGE', value: string };

const triggerReducer = (state: typeof initTriggerState, action: ACTION_TYPE) => {
  const { type, value } = action;
  if (type === 'TOGGLE_MUTE') {
    if (state.musicVolume === 'mute') {
      return { ...state, musicVolume: 'normal' };
    } else {
      return { ...state, musicVolume: 'mute' };
    }
  }
  if (type === 'THEME_CHANGE') {
    return { ...state, theme: value };
  }
  return { ...state };
};

const {
  publisher,
  dispatch,
  PubSubProvider,
  useSubscribe,
  usePubSubContext
} = createPubSubContext(initTriggerState, triggerReducer);

const useGlobalTriggerContext = usePubSubContext;

// 另一种写法：
// createPubSub<typeof initTriggerState, ACTION_TYPE>(
//   initTriggerState, (publisher) => {
//     return (prevState, action) => {
//       const { type, value } = action;
//       if (type === 'TOGGLE_MUTE') {
//         if (prevState.musicVolume === 'mute') {
//           publisher.publish('musicVolume', 'normal');
//         } else {
//           publisher.publish('musicVolume', 'mute');
//         }
//       }
//       if (type === 'THEME_CHANGE') {
//         publisher.publish('theme', value || '');
//       }
//     }
//   }
// );

// 调试用
window.dispatch = dispatch;
window.publisher = publisher;

const RenderCounter = () => {
  const time = useRef(0);
  time.current = time.current + 1;
  return <div>RenderTime: {time.current}</div>;
};

const ThemeController = () => {
  const { dispatch } = useGlobalTriggerContext();
  const state = {
    theme: useSubscribe('theme')
  };
  const themeToggle = () => {
    if (state.theme === 'dark') {
      dispatch({ type: 'THEME_CHANGE', value: 'light' });
    } else {
      dispatch({ type: 'THEME_CHANGE', value: 'dark' });
    }
  };
  return <div onClick={themeToggle}>
    Toggle Theme! Current: {state.theme}
    <RenderCounter />
  </div>;
};

const VideoController = () => {
  const { dispatch } = useGlobalTriggerContext();
  const state = {
    musicVolume: useSubscribe('musicVolume')
  };
  const muteToggle = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
  };
  return <div onClick={muteToggle}>
    Toggle Mute! Current: {state.musicVolume}
    <RenderCounter />
  </div>;
};

const Logo = () => {
  const state = {
    theme: useSubscribe('theme')
  };
  return <div>
    LogoWithTheme: {state.theme}
    <RenderCounter />
  </div>;
};

export const MainPubSub = () => {
  return <PubSubProvider>
    <p>PubSub改造版</p>
    <ThemeController />
    <VideoController />
    <Logo />
    改造点：<br />
    1、使用createPubSubContext，传入state和reducer创建PubSub相关实例<br />
    2、各依赖Context的组件，将其useContext的state改为使用useSubscribe进行订阅<br />
  </PubSubProvider>;
};