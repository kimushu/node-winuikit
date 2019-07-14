import * as ffi from "ffi";
import * as ref from "ref";
import * as refStruct from "ref-struct";
import { LONG, WPARAM, HWND, UINT, LPARAM, DWORD, HINSTANCE, LPCSTR, HICON, HCURSOR, CALLBACK, INT, HMENU, LPSTR, ULONG_PTR, HBRUSH, HBITMAP, BOOL, LRESULT, LPVOID, LONG_PTR, HANDLE, ATOM, UCS2STR } from "./windef";

/**
 * Typedefs
 */

/**
 * Structure for 2D point
 */
export type POINT = {
  x: LONG, y: LONG,
};
export const POINT = refStruct({
  x: LONG, y: LONG,
});

/**
 * Structure for 2D rectangle
 */
export type RECT = {
  left: LONG, top: LONG, right: LONG, bottom: LONG,
};
export const RECT = refStruct({
  left: LONG, top: LONG, right: LONG, bottom: LONG,
});

/**
 * Structure for window message
 */
export type MSG = {
  hWnd: HWND, uMsg: WindowMessages, wParam: WPARAM, lParam: LPARAM, time: DWORD, pt: POINT,
};
export const MSG = refStruct({
  hWnd: HWND, uMsg: UINT,           wParam: WPARAM, lParam: LPARAM, time: DWORD, pt: POINT,
});

/**
 * Structure for window class
 */
export type WNDCLASSEXA = {
  cbSize: UINT, style: UINT, lpfnWndProc: CALLBACK, cbClsExtra: INT, cbWndExtra: INT,
  hInstance: HINSTANCE, hIcon: HICON, hCursor: HCURSOR, hbrBackground: HBRUSH,
  lpszMenuName: LPCSTR, lpszClassName: LPCSTR, hIconSm: HICON,
};
export const WNDCLASSEXA = refStruct({
  cbSize: UINT, style: UINT, lpfnWndProc: CALLBACK, cbClsExtra: INT, cbWndExtra: INT,
  hInstance: HINSTANCE, hIcon: HICON, hCursor: HCURSOR, hbrBackground: HBRUSH,
  lpszMenuName: LPCSTR, lpszClassName: LPCSTR, hIconSm: HICON,
});

/**
 * Structure for menu item info
 */
export type MENUITEMINFOA = {
  cbSize: UINT, fMask: UINT, fType: UINT, fState: UINT, wID: UINT,
  hSubMenu: HMENU, hbmpChecked: HBITMAP, hbmpUnchecked: HBITMAP,
  dwItemData: ULONG_PTR, dwTypeData: LPSTR, cch: UINT, hbmpItem: HBITMAP,
};
export const MENUITEMINFOA = refStruct({
  cbSize: UINT, fMask: UINT, fType: UINT, fState: UINT, wID: UINT,
  hSubMenu: HMENU, hbmpChecked: HBITMAP, hbmpUnchecked: HBITMAP,
  dwItemData: ULONG_PTR, dwTypeData: LPSTR, cch: UINT, hbmpItem: HBITMAP,
});

export enum ImageType {
  IMAGE_BITMAP    = 0,
  IMAGE_ICON      = 1,
  IMAGE_CURSOR    = 2,
}

export enum LoadResourceFlags {
  LR_CREATEDIBSECTION = 0x00002000,
  LR_DEFAULTCOLOR     = 0x00000000,
  LR_DEFAULTSIZE      = 0x00000040,
  LR_LOADFROMFILE     = 0x00000010,
  LR_LOADMAP3DCOLORS  = 0x00001000,
  LR_LOADTRANSPARENT  = 0x00000020,
  LR_MONOCHROME       = 0x00000001,
  LR_SHARED           = 0x00008000,
  LR_VGACOLOR         = 0x00000080,
}

export enum MenuFlags {
  MF_BITMAP       = 0x0004,
  MF_CHECKED      = 0x0008,
  MF_DISABLED     = 0x0002,
  MF_GRAYED       = 0x0001,
  MF_MENUBARBREAK = 0x0020,
  MF_MENUBREAK    = 0x0040,
  MF_OWNERDRAW    = 0x0100,
  MF_POPUP        = 0x0010,
  MF_SEPARATOR    = 0x0800,
  MF_STRING       = 0x0000,
  MF_UNCHECKED    = 0x0000,

  MF_BYCOMMAND    = 0x0000,
  MF_BYPOSITION   = 0x0400,
}

export enum Modifiers {
  MOD_ALT         = 0x0001,
  MOD_CONTROL     = 0x0002,
  MOD_SHIFT       = 0x0004,
  MOD_WIN         = 0x0008,
  MOD_NOREPEAT    = 0x4000,
}

export enum QueueStatus {
  QS_ALLINPUT     = 0x04ff,
}

export enum TrackPopupMenuFlags {
  TPM_CENTERALIGN   = 0x0004,
  TPM_LEFTALIGN     = 0x0000,
  TPM_RIGHTALIGN    = 0x0008,

  TPM_BOTTOMALIGN   = 0x0020,
  TPM_TOPALIGN      = 0x0000,
  TPM_VCENTERALIGN  = 0x0010,

  TPM_NONOTIFY      = 0x0080,
  TPM_RETURNCMD     = 0x0100,

  TPM_LEFTBUTTON    = 0x0000,
  TPM_RIGHTBUTTON   = 0x0002,
}

export enum WindowMessages {
  WM_COMMAND        = 0x0111,
  WM_MOUSEMOVE      = 0x0200,
  WM_LBUTTONDOWN    = 0x0201,
  WM_LBUTTONUP      = 0x0202,
  WM_LBUTTONDBLCLK  = 0x0203,
  WM_RBUTTONDOWN    = 0x0204,
  WM_RBUTTONUP      = 0x0205,
  WM_RBUTTONDBLCLK  = 0x0206,
  WM_MBUTTONDOWN    = 0x0207,
  WM_MBUTTONUP      = 0x0208,
  WM_MBUTTONDBLCLK  = 0x0209,
  WM_HOTKEY         = 0x0312,
  WM_USER           = 0x0400,
  WM_APP            = 0x8000,
}

export const HWND_MESSAGE = -3;

const User32 = new ffi.Library("User32", {
  "AppendMenuA": [BOOL, [HMENU, UINT, ULONG_PTR, LPCSTR]],
  "AppendMenuW": [BOOL, [HMENU, UINT, ULONG_PTR, UCS2STR]],
  "CreateMenu": [HMENU, []],
  "CreatePopupMenu": [HMENU, []],
  "CreateWindowExA": [HWND, [DWORD, LPCSTR, LPCSTR, DWORD, INT, INT, INT, INT, LONG_PTR, HMENU, HINSTANCE, LPVOID]],
  "DefWindowProcA": [LRESULT, [HWND, UINT, WPARAM, LPARAM]],
  "DestroyIcon": [BOOL, [HICON]],
  "DestroyMenu": [BOOL, [HMENU]],
  "DestroyWindow": [BOOL, [HWND]],
  "GetCursorPos": [BOOL, [ref.refType(POINT)]],
  "InsertMenuItemA": [BOOL, [HMENU, UINT, BOOL, ref.refType(MENUITEMINFOA)]],
  "LoadImageA": [HANDLE, [HINSTANCE, LPCSTR, UINT, INT, INT, UINT]],
  "MsgWaitForMultipleObjects": [DWORD, [DWORD, ref.refType(HANDLE), BOOL, DWORD, DWORD]],
  "PeekMessageA": [BOOL, [ref.refType(MSG), HWND, UINT, UINT, UINT]],
  "RegisterClassExA": [ATOM, [ref.refType(WNDCLASSEXA)]],
  "RegisterHotKey": [BOOL, [HWND, INT, UINT, UINT]],
  "TrackPopupMenu": [BOOL, [HMENU, UINT, INT, INT, INT, HWND, ref.refType(RECT)]],
  "UnregisterHotKey": [BOOL, [HWND, INT]],
}) as {
  AppendMenuA: (hMenu: HMENU, uFlags: UINT, uIDNewItem: ULONG_PTR, lpNewItem: LPCSTR) => BOOL,
  AppendMenuW: (hMenu: HMENU, uFlags: UINT, uIDNewItem: ULONG_PTR, lpNewItem: UCS2STR) => BOOL,
  CreateMenu: () => HMENU,
  CreatePopupMenu: () => HMENU,
  CreateWindowExA: (dwExStyle: DWORD, lpClassName: LPCSTR, lpWindowName: LPCSTR, dwStyle: DWORD, X: INT, Y: INT, nWidth: INT, nHeight: INT, hWndParent: LONG_PTR, hMenu: HMENU, hInstance: HINSTANCE, lpParam: LPVOID) => HWND;
  DefWindowProcA: (hWnd: HWND, uMsg: UINT, wParam: WPARAM, lParam: LPARAM) => LRESULT,
  DestroyIcon: (hIcon: HICON) => BOOL,
  DestroyMenu: (hMenu: HMENU) => BOOL,
  DestroyWindow: (hWnd: HWND) => BOOL,
  GetCursorPos: (lpPoint: ref.Type) => BOOL,
  InsertMenuItemA: (hmenu: HMENU, item: UINT, fByPosition: BOOL, lpmi: ref.Type) => BOOL,
  LoadImageA: (hInst: HINSTANCE, name: LPCSTR, type: UINT, cx: INT, cy: INT, fuLoad: UINT) => HANDLE,
  MsgWaitForMultipleObjects: (nCount: DWORD, pHandles: ref.Type, fWaitAll: BOOL, dwMilliseconds: DWORD, dwWakeMask: DWORD) => DWORD,
  PeekMessageA: (msg: ref.Type, hWnd: HWND, wMsgFilterMin: UINT, wMsgFilterMax: UINT, wRemoveMsg: UINT) => BOOL,
  RegisterClassExA: (wcl: ref.Type) => ATOM;
  RegisterHotKey: (hWnd: HWND, id: INT, fsModifiers: UINT, vk: UINT) => BOOL,
  TrackPopupMenu: (hMenu: HMENU, uFlags: UINT, x: INT, y: INT, nReserved: INT, hWnd: HWND, prcRect: ref.Type) => BOOL,
  UnregisterHotKey: (hWnd: HWND, id: INT) => BOOL,
};

export const {
  AppendMenuA,
  AppendMenuW,
  CreateMenu,
  CreatePopupMenu,
  CreateWindowExA,
  DefWindowProcA,
  DestroyIcon,
  DestroyMenu,
  DestroyWindow,
  GetCursorPos,
  InsertMenuItemA,
  LoadImageA,
  MsgWaitForMultipleObjects,
  PeekMessageA,
  RegisterClassExA,
  RegisterHotKey,
  TrackPopupMenu,
  UnregisterHotKey,
} = User32;
