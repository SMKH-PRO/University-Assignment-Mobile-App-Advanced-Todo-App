declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-drawer' {
  import React from 'react';

  interface DrawerProps {
    type?: 'overlay' | 'displace' | 'static';
    content: React.ReactNode;
    side?: 'left' | 'right';
    openDrawerOffset?: number;
    closedDrawerOffset?: number;
    panCloseMask?: number;
    tapToClose?: boolean;
    styles?: Record<string, any>;
    tweenHandler?: (ratio: number) => any;
    onOpen?: () => void;
    onClose?: () => void;
    ref?: React.RefObject<any>;
  }

  class Drawer extends React.Component<DrawerProps> {
    open(): void;
    close(): void;
  }

  export default Drawer;
}

declare module 'qs' {
  interface IStringifyOptions {
    delimiter?: string;
    arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma';
    encode?: boolean;
  }

  interface IParseOptions {
    delimiter?: string;
    depth?: number;
    arrayLimit?: number;
    parseArrays?: boolean;
    allowDots?: boolean;
    plainObjects?: boolean;
    allowPrototypes?: boolean;
    parameterLimit?: number;
    strictNullHandling?: boolean;
  }

  export function stringify(obj: any, options?: IStringifyOptions): string;
  export function parse(str: string, options?: IParseOptions): any;

  export default {
    stringify,
    parse,
  };
}

declare module 'react-native-vector-icons/FontAwesome' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Icon extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Icon extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/Entypo' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Icon extends Component<IconProps> { }
}

declare module 'react-redux' {
  import { ComponentType, ReactNode } from 'react';
  import { Store, Action, AnyAction } from 'redux';
  import type { ThunkDispatch } from '@reduxjs/toolkit';

  export interface DispatchProp<A extends Action = AnyAction> {
    dispatch: Dispatch<A>;
  }

  export type Dispatch<A extends Action = AnyAction> = (action: A) => A;

  export function useDispatch<AppDispatch = any>(): AppDispatch;
  export function useSelector<TState = any, TSelected = any>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;

  export function useStore<S = any, A extends Action = AnyAction>(): Store<S, A>;

  export interface TypedUseSelectorHook<TState> {
    <TSelected>(selector: (state: TState) => TSelected, equalityFn?: (left: TSelected, right: TSelected) => boolean): TSelected;
  }

  export interface ProviderProps<A extends Action = AnyAction> {
    store: Store<any, A>;
    children: ReactNode;
  }

  export const Provider: React.ComponentType<ProviderProps>;
}
declare module 'faker' {
  export const image: {
    avatar: () => string;
  };
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    baseURL?: string;
    headers?: any;
    params?: any;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    responseType?: string;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
  }

  export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
  }

  export interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>;
    (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    defaults: AxiosRequestConfig;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  }

  export function create(config?: AxiosRequestConfig): AxiosInstance;
  export default create();
}

declare module 'diacritics' {
  export function remove(str: string): string;
}

declare module 'react-native-dropdownalert' {
  import { ComponentType, ReactNode } from 'react';
  import { ViewStyle, TextStyle, ColorValue } from 'react-native';

  export enum DropdownAlertType {
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
    Success = 'success',
  }

  export enum DropdownAlertColor {
    Info = '#2B73B6',
    Warn = '#cd853f',
    Error = '#cc3232',
    Success = '#32A54A',
    Default = 'dimgray',
  }

  export type DropdownAlertData = {
    type?: string;
    title?: string;
    message?: string;
    source?: any;
    interval?: number;
    action?: string;
  };

  export interface DropdownAlertProps {
    alert?: (func: (data?: DropdownAlertData) => Promise<DropdownAlertData>) => void;
    dismiss?: (func: () => void) => void;
    onDismiss?: (data: DropdownAlertData) => void;
    dismissInterval?: number;
    closeInterval?: number;
    onDismissPressDisabled?: boolean;
    updateStatusBar?: boolean;
    activeStatusBarStyle?: string;
    activeStatusBarBackgroundColor?: ColorValue;
    inactiveStatusBarStyle?: string;
    inactiveStatusBarBackgroundColor?: ColorValue;
    showCancel?: boolean;
    translucent?: boolean;
    renderImage?: (props: any) => ReactNode;
    renderCancel?: (props: any) => ReactNode;
    renderTitle?: (props: any) => ReactNode;
    renderMessage?: (props: any) => ReactNode;
    infoColor?: ColorValue;
    warnColor?: ColorValue;
    errorColor?: ColorValue;
    successColor?: ColorValue;
    defaultTextContainer?: ViewStyle;
    defaultContainer?: ViewStyle;
    defaultText?: TextStyle;
    defaultImageStyle?: any;
    defaultCancelContainer?: ViewStyle;
    defaultCancelText?: TextStyle;
    contentContainerStyle?: ViewStyle;
    imageStyle?: any;
    titleStyle?: TextStyle;
    messageStyle?: TextStyle;
    cancelBtnImageStyle?: any;
    alertViewStyle?: ViewStyle;
    textContainerStyle?: ViewStyle;
    cancelContainerStyle?: ViewStyle;
    cancelTextStyle?: TextStyle;
    zIndex?: number;
    elevation?: number;
    sensitivity?: number;
    alertPosition?: 'top' | 'bottom';
    children?: ReactNode;
  }
  
  const DropdownAlert: ComponentType<DropdownAlertProps>;
  export default DropdownAlert;
} 