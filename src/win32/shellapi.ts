import * as ffi from "ffi";
import * as ref from "ref";
import * as refStruct from "ref-struct";

import { GUID } from "./guiddef";
import { HWND, HICON, UINT, DWORD, WSTRBUF, BOOL } from "./windef";

export type NOTIFYICONDATAW = {
  cbSize: DWORD, hWnd: HWND, uID: UINT, uFlags: UINT, uCallbackMessage: UINT,
  hIcon: HICON, szTip: WSTRBUF<128>,
  dwState: DWORD, dwStateMask: DWORD,
  szInfo: WSTRBUF<256>, uTimeout: UINT,
  szInfoTitle: WSTRBUF<64>,
  dwInfoFlags: DWORD, guidItem: GUID, hBalloonIcon: HICON,
};
export const NOTIFYICONDATAW = refStruct({
  cbSize: DWORD, hWnd: HWND, uID: UINT, uFlags: UINT, uCallbackMessage: UINT,
  hIcon: HICON, szTip: WSTRBUF(128),
  dwState: DWORD, dwStateMask: DWORD,
  szInfo: WSTRBUF(256), uTimeout: UINT,
  szInfoTitle: WSTRBUF(64),
  dwInfoFlags: DWORD, guidItem: GUID, hBalloonIcon: HICON,
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
  "Shell_NotifyIconW": [BOOL, [DWORD, ref.refType(NOTIFYICONDATAW)]],
}) as {
  Shell_NotifyIconW: (dwMessage: number, lpData: ref.Type) => boolean
};

export const { Shell_NotifyIconW } = Shell32;
