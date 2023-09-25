/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useReducer, useRef } from "react";

/**
 * 例子：假如当前是一个视频播放页面，配置背景色、音量、播放速度等
 */
// 基础配置
const initTriggerState = {
  theme: 'dark',
  musicVolume: 'mute',
  speed: '1',
};

const triggerReducer = (state: typeof initTriggerState, action: { type: string, value: any }) => {
  const { type, value } = action;
  if (type === 'TOGGLE_MUTE') {
    if (state.musicVolume === 'mute') {
      // changeState
      return { ...state, musicVolume: 'normal' };
    } else {
      // changeState
      return { ...state, musicVolume: 'mute' };
    }
  }
  if (type === 'THEME_CHANGE') {
    // changeState
    return { ...state, theme: value };
  }
  return { ...state };
};

interface IGlobalContext {
  state: typeof initTriggerState;
  dispatch: (action: { type: string, value: any }) => void;
}

const GlobalTriggerContext = createContext<IGlobalContext>({} as unknown as IGlobalContext);

const useGlobalTriggerContext = () => useContext(GlobalTriggerContext);

export const GlobalTriggerContextProvider: React.FC<{ children: React.ReactNode }> = (props: {
  children: React.ReactNode;
}) => {
  // Provider中提供一个基于pubsub的state，同时提供reducer管理该state
  const [state, dispatch] = useReducer(triggerReducer, initTriggerState);
  return <GlobalTriggerContext.Provider value={{ state, dispatch }}>
    {props.children}
  </GlobalTriggerContext.Provider>;
};

const RenderCounter = () => {
  const time = useRef(0);
  time.current = time.current + 1;
  return <div>RenderTime: {time.current}</div>;
};

const ThemeController = () => {
  const { state, dispatch } = useGlobalTriggerContext();
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
  const { state, dispatch } = useGlobalTriggerContext();
  const muteToggle = () => {
    dispatch({ type: 'TOGGLE_MUTE', value: null });
  };
  return <div onClick={muteToggle}>
    Toggle Mute! Current: {state.musicVolume}
    <RenderCounter />
  </div>;
};

const Logo = () => {
  const { state } = useGlobalTriggerContext();
  return <div>
    LogoWithTheme: {state.theme}
    <RenderCounter />
  </div>;
};

export const MainWithContext = () => {
  return <GlobalTriggerContextProvider>
    <p>问题：均引用同一个context.state，dispatch后对全局生效，导致另一个组件也重新渲染</p>
    <ThemeController />
    <VideoController />
    <Logo />
  </GlobalTriggerContextProvider>;
};