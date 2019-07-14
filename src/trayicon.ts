import { EventEmitter } from "events";
import { Icon } from "./icon";
import { NOTIFYICONDATAA, NotifyIconFlags, Shell_NotifyIconA, NotifyIconMessage } from "./win32/shellapi";
import { CreateWindowExA, HWND_MESSAGE, WindowMessages, MSG, WNDCLASSEXA, RegisterClassExA, DefWindowProcA, DestroyWindow } from "./win32/winuser";
import * as ffi from "ffi";
import { WPARAM, LPARAM, HWND, LRESULT, UINT, CALLBACK } from "./win32/windef";
import * as debug_module from "debug";

const debug = debug_module("wuk:trayicon");
const WM_TRAYICON = WindowMessages.WM_APP + 1;

export class TrayIcon extends EventEmitter {
  readonly id: number;

  constructor(private icon: Icon, toolTip: string = null) {
    super();
    this.nid = new NOTIFYICONDATAA({});
    this.nid.cbSize = NOTIFYICONDATAA.size;
    this.nid.hWnd = new.target.createReceiver();
    this.nid.uID = this.id = new.target.nextId;
    this.nid.uFlags = NotifyIconFlags.NIF_ICON | NotifyIconFlags.NIF_MESSAGE;
    this.nid.uCallbackMessage = WM_TRAYICON;
    this.nid.hIcon = icon.handle;
    if (toolTip != null) {
      this.nid.szTip.buffer.write(toolTip, 0, this.nid.szTip.buffer.length - 1);
      this.nid.uFlags |= NotifyIconFlags.NIF_TIP;
    }
    this.update(NotifyIconMessage.NIM_ADD);
    ++new.target.nextId;
    new.target.trayIcons[this.id] = this;
  }

  setToolTip(value: string): void {
    const { buffer } = this.nid.szTip;
    buffer.fill(0);
    buffer.write(value, 0, buffer.length - 1);
    this.nid.uFlags |= NotifyIconFlags.NIF_TIP;
    this.update();
  }

  setInfo(text: string, title: string): void {
    {
      const { buffer } = this.nid.szInfo;
      buffer.fill(0);
      buffer.write(text, 0, buffer.length - 1);
    }
    {
      const { buffer } = this.nid.szInfoTitle;
      buffer.fill(0);
      buffer.write(title, 0, buffer.length - 1);
    }
    this.nid.uFlags |= NotifyIconFlags.NIF_INFO;
    this.update();
  }

  dispose(): void {
    this.update(NotifyIconMessage.NIM_DELETE);
    this.nid = null;
  }

  private update(message = NotifyIconMessage.NIM_MODIFY): void {
    if (!Shell_NotifyIconA(message, (this.nid as any).ref())) {
      throw Error("Shell_NotifyIconA() failed");
    }
  }

  private static dispatch(wParam: WPARAM, lParam: LPARAM): void {
    const id = wParam;
    const trayIcon = this.trayIcons[id];
    if (trayIcon == null) {
      return;
    }
    switch (lParam) {
      case WindowMessages.WM_MOUSEMOVE:
        trayIcon.emit("move");
        break;
      case WindowMessages.WM_LBUTTONDOWN:
        trayIcon.emit("button", {left: true, down: true});
        break;
      case WindowMessages.WM_LBUTTONUP:
        trayIcon.emit("button", {left: true, up: true});
        break;
      case WindowMessages.WM_LBUTTONDBLCLK:
        trayIcon.emit("button", {left: true, doubleClick: true});
        break;
      case WindowMessages.WM_RBUTTONDOWN:
        trayIcon.emit("button", {right: true, down: true});
        break;
      case WindowMessages.WM_RBUTTONUP:
        trayIcon.emit("button", {right: true, up: true});
        break;
      case WindowMessages.WM_RBUTTONDBLCLK:
        trayIcon.emit("button", {right: true, doubleClick: true});
        break;
      case WindowMessages.WM_MBUTTONDOWN:
        trayIcon.emit("button", {middle: true, down: true});
        break;
      case WindowMessages.WM_MBUTTONUP:
        trayIcon.emit("button", {middle: true, up: true});
        break;
      case WindowMessages.WM_MBUTTONDBLCLK:
        trayIcon.emit("button", {middle: true, doubleClick: true});
        break;
    }
  }

  private static createReceiver(): HWND {
    if (this.hWndReceiver != null) {
      return this.hWndReceiver;
    }
    const wcl: WNDCLASSEXA = new WNDCLASSEXA({});
    wcl.cbSize = WNDCLASSEXA.size;
    this.wndProc = ffi.Callback(
      LRESULT, [HWND, UINT, WPARAM, LPARAM],
      (hWnd: HWND, uMsg: UINT, wParam: WPARAM, lParam: LPARAM): LRESULT => {
        if (uMsg === WM_TRAYICON) {
          this.dispatch(wParam, lParam);
        }
        return DefWindowProcA(hWnd, uMsg, wParam, lParam);
      }
    );
    wcl.lpfnWndProc = this.wndProc;
    wcl.lpszClassName = "winhotkey.trayicon";
    if (RegisterClassExA((wcl as any).ref()) === 0) {
      throw Error("RegisterClassExA() failed");
    }
    const hWnd = CreateWindowExA(0, wcl.lpszClassName, null, 0, 0, 0, 0, 0, HWND_MESSAGE, null, null, 0);
    this.hWndReceiver = hWnd;
    debug(`Created receiver window (hWnd: ${hWnd})`);
    process.on("exit", () => {
      this.hWndReceiver = null;
      DestroyWindow(hWnd);
      debug(`Destroyed receiver window (hWnd: ${hWnd})`);
    });
    return hWnd;
  }

  private nid: NOTIFYICONDATAA;
  private static trayIcons: TrayIcon[] = [];
  private static nextId = 1;
  private static hWndReceiver: HWND;
  private static wndProc: CALLBACK;
}
