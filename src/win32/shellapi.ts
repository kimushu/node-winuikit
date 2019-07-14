import * as ffi from "ffi";
import * as ref from "ref";
import * as refStruct from "ref-struct";
import * as refArray from "ref-array";

type ArrayInstance<T> = {
  [i: number]: T; length: number; toArray(): T[];
  toJSON(): T[]; inspect(): string; buffer: Buffer; ref(): Buffer;
};

import { GUID } from "./guiddef";
import { HWND, HICON } from "./windef";

export type NOTIFYICONDATAA = {
  cbSize: number;
  hWnd: HWND;
  uID: number;
  uFlags: number;
  uCallbackMessage: number;
  hIcon: HICON;
  szTip: ArrayInstance<number>;
  dwState: number;
  dwStateMask: number;
  szInfo: ArrayInstance<number>;
  uTimeout: number;
  szInfoTitle: ArrayInstance<number>;
  dwInfoFlags: number;
  guidItem: GUID;
  hBalloonIcon: HICON;
};
export const NOTIFYICONDATAA = refStruct({
  cbSize: ref.types.uint32,
  hWnd: HWND,
  uID: ref.types.uint32,
  uFlags: ref.types.uint32,
  uCallbackMessage: ref.types.uint32,
  hIcon: HICON,
  szTip: refArray(ref.types.char, 128),
  dwState: ref.types.uint32,
  dwStateMask: ref.types.uint32,
  szInfo: refArray(ref.types.char, 256),
  uTimeout: ref.types.uint32,
  szInfoTitle: refArray(ref.types.char, 64),
  dwInfoFlags: ref.types.uint32,
  guidItem: GUID,
  hBalloonIcon: HICON,
});

export enum NotifyIconFlags {
  NIF_MESSAGE     = 0x01,
  NIF_ICON        = 0x02,
  NIF_TIP         = 0x04,
  NIF_STATE       = 0x08,
  NIF_INFO        = 0x10,
  NIF_GUID        = 0x20,
  NIF_REALTIME    = 0x40,
  NIF_SHOWTIP     = 0x80,
}

export enum NotifyIconState {
  NIS_HIDDEN      = 0x01,
  NIS_SHAREDICON  = 0x02,
}

export enum NotifyIconInfoFlags {
  NIIF_NONE       = 0x00,
  NIIF_INFO       = 0x01,
  NIIF_WARNING    = 0x02,
  NIIF_ERROR      = 0x03,
  NIIF_USER       = 0x04,
  NIIF_NOSOUND    = 0x10,
  NIIF_LARGE_ICON         = 0x20,
  NIIF_RESPECT_QUIET_TIME = 0x80,
  NIIF_ICON_MASK          = 0x0f,
}

export enum NotifyIconMessage {
  NIM_ADD         = 0x0,
  NIM_MODIFY      = 0x1,
  NIM_DELETE      = 0x2,
  NIM_SETFOCUS    = 0x3,
}

const Shell32 = ffi.Library("shell32", {
  "Shell_NotifyIconA": ["bool", ["uint32", ref.refType(NOTIFYICONDATAA)]],
}) as {
  Shell_NotifyIconA: (dwMessage: number, lpData: ref.Type) => boolean
};

export const { Shell_NotifyIconA } = Shell32;
