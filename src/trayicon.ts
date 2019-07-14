import { EventEmitter } from "events";
import { Icon } from "./icon";
import { NOTIFYICONDATAW, NotifyIconFlags, Shell_NotifyIconW, NotifyIconMessage } from "./win32/shellapi";
import { WindowMessages, MSG, } from "./win32/winuser";
import * as debug_module from "debug";
import { SendMessageReceiver } from "./messagereceiver";

const debug = debug_module("wuk:trayicon");
const WM_TRAYICON = WindowMessages.WM_APP + 1;

export class TrayIcon extends EventEmitter {
  readonly id: number;

  constructor(private icon: Icon, toolTip: string = null) {
    super();
    this.receiver = new SendMessageReceiver({
      uMsg: WM_TRAYICON,
      wParam: this.id,
    }, (msg: MSG) => {
      switch (msg.lParam) {
        case WindowMessages.WM_MOUSEMOVE:     this.emit("mouseMove"); return 0;
        case WindowMessages.WM_LBUTTONDOWN:   this.emit("leftButtonDown"); return 0;
        case WindowMessages.WM_LBUTTONUP:     this.emit("leftButtonUp"); return 0;
        case WindowMessages.WM_LBUTTONDBLCLK: this.emit("leftButtonDoubleClick"); return 0;
        case WindowMessages.WM_RBUTTONDOWN:   this.emit("rightButtonDown"); return 0;
        case WindowMessages.WM_RBUTTONUP:     this.emit("rightButtonUp"); return 0;
        case WindowMessages.WM_RBUTTONDBLCLK: this.emit("rightButtonDoubleClick"); return 0;
        case WindowMessages.WM_MBUTTONDOWN:   this.emit("middleButtonDown"); return 0;
        case WindowMessages.WM_MBUTTONUP:     this.emit("middleButtonUp"); return 0;
        case WindowMessages.WM_MBUTTONDBLCLK: this.emit("middleButtonDoubleClick"); return 0;
      }
    });
    this.nid = new NOTIFYICONDATAW({});
    this.nid.cbSize = NOTIFYICONDATAW.size;
    this.nid.hWnd = this.receiver.handle;
    this.nid.uID = this.id = new.target.nextId;
    this.nid.uFlags = NotifyIconFlags.NIF_ICON | NotifyIconFlags.NIF_MESSAGE;
    this.nid.uCallbackMessage = WM_TRAYICON;
    this.nid.hIcon = icon.handle;
    if (toolTip != null) {
      this.nid.szTip = toolTip;
      this.nid.uFlags |= NotifyIconFlags.NIF_TIP;
    }
    this.update(NotifyIconMessage.NIM_ADD);
    process.on("exit", () => this.dispose());
    ++new.target.nextId;
  }

  setToolTip(value: string): void {
    this.nid.szTip = value;
    this.nid.uFlags |= NotifyIconFlags.NIF_TIP;
    this.update();
  }

  setInfo(text: string, title: string): void {
    this.nid.szInfo = text;
    this.nid.szInfoTitle = title;
    this.nid.uFlags |= NotifyIconFlags.NIF_INFO;
    this.update();
  }

  dispose(): void {
    if (this.receiver != null) {
      this.receiver.dispose();
      this.receiver = null;
    }
    this.update(NotifyIconMessage.NIM_DELETE);
    this.nid = null;
  }

  private update(message = NotifyIconMessage.NIM_MODIFY): void {
    if (!Shell_NotifyIconW(message, (this.nid as any).ref())) {
      throw Error("Shell_NotifyIconA() failed");
    }
  }

  private nid: NOTIFYICONDATAW;
  private receiver: SendMessageReceiver;
  private static nextId = 1;
}
