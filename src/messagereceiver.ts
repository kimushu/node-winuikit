import { UINT, WPARAM, LPARAM, LRESULT, CALLBACK, HWND } from "./win32/windef";
import { WNDCLASSEXA, DefWindowProcA, RegisterClassExA, CreateWindowExA, HWND_MESSAGE, DestroyWindow, MsgWaitForMultipleObjects, QueueStatus, MSG, PeekMessageA } from "./win32/winuser";
import * as ffi from "ffi";
import * as debugModule from "debug";
const debug = debugModule("wuk:messagereceiver");

type MSGCALLBACK = (msg: MSG) => LRESULT | void;
type MSGCONDITION = {uMsg?: UINT, wParam?: WPARAM, lParam?: LPARAM};

export interface MessageReceiver {
  dispose(): void;
}

class MessageLoop {
  addListener(receiver: any, condition: MSGCONDITION, callback: MSGCALLBACK): void {
    this.removeListener(receiver);
    this.listeners.push({receiver, condition, callback});
    if (this.timer == null) {
      this.timer = setImmediate(this.poller);
    }
  }

  removeListener(receiver: any): void {
    let index = this.listeners.findIndex((listener) => listener.receiver === receiver);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  static readonly instance = new MessageLoop();
  public waitInterval = 500;

  private constructor() {
  }

  private poll() {
    if (this.listeners.length === 0) {
      this.timer = null;
      return;
    }
    if (MsgWaitForMultipleObjects(0, null, false,
        this.waitInterval, QueueStatus.QS_ALLINPUT) === 0) {
      const msg: MSG = new MSG({});
      if (PeekMessageA((msg as any).ref(), null, 0, 0, 1)) {
        for (let listener of this.listeners) {
          const { condition } = listener;
          if (((condition.uMsg === undefined) || (condition.uMsg === msg.uMsg)) &&
              ((condition.wParam === undefined) || (condition.wParam === msg.wParam)) &&
              ((condition.lParam === undefined) || (condition.lParam === msg.lParam))) {
            try {
              const result = listener.callback(msg);
              if (result !== undefined) {
                break;
              }
            } catch (error) {
              debug(`Uncaught exception in message loop: ${error}`);
            }
          }
        }
      }
    }
    this.timer = setImmediate(this.poller);
  }

  private poller = this.poll.bind(this);
  private timer: NodeJS.Immediate;
  private listeners: {receiver: any, condition: MSGCONDITION, callback: MSGCALLBACK}[] = [];
}

export class PostMessageReceiver implements MessageReceiver {
  constructor(condition: MSGCONDITION, callback: MSGCALLBACK) {
    MessageLoop.instance.addListener(this, condition, callback);
  }

  dispose(): void {
    MessageLoop.instance.removeListener(this);
  }

  get waitInterval(): number {
    return MessageLoop.instance.waitInterval;
  }

  set waitInterval(value: number) {
    MessageLoop.instance.waitInterval = value;
  }
}

class MessageReceiverWindow {
  addListener(receiver: any, condition: MSGCONDITION, callback: MSGCALLBACK): void {
    this.removeListener(receiver);
    this.listeners.push({receiver, condition, callback});
  }

  removeListener(receiver: any): void {
    let index = this.listeners.findIndex((listener) => listener.receiver === receiver);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  get handle(): HWND {
    return this.hWnd;
  }

  static readonly instance = new MessageReceiverWindow();

  private constructor() {
    debug("Creating receiver window");
    const wcl: WNDCLASSEXA = new WNDCLASSEXA({});
    wcl.cbSize = WNDCLASSEXA.size;
    this.wndProc = ffi.Callback(
      LRESULT, [HWND, UINT, WPARAM, LPARAM],
      (hWnd: HWND, uMsg: UINT, wParam: WPARAM, lParam: LPARAM): LRESULT => {
        const result = this.dispatch({hWnd, uMsg, wParam, lParam, time: null, pt: null});
        if (result === undefined) {
          return DefWindowProcA(hWnd, uMsg, wParam, lParam);
        }
        return result as LRESULT;
      }
    );
    wcl.lpfnWndProc = this.wndProc;
    wcl.lpszClassName = "winuikit.MessageReceiverWindow";
    if (RegisterClassExA((wcl as any).ref()) === 0) {
      throw Error("RegisterClassExA() failed");
    }
    this.hWnd = CreateWindowExA(0, wcl.lpszClassName, null, 0, 0, 0, 0, 0, HWND_MESSAGE, null, null, 0);
    process.on("exit", () => this.dispose());
  }

  private dispatch(msg: MSG): LRESULT | void {
    for (let listener of this.listeners) {
      const { condition } = listener;
      if (((condition.uMsg === undefined) || (condition.uMsg === msg.uMsg)) &&
          ((condition.wParam === undefined) || (condition.wParam === msg.wParam)) &&
          ((condition.lParam === undefined) || (condition.lParam === msg.lParam))) {
        try {
          const result = listener.callback(msg);
          if (result !== undefined) {
            return result;
          }
        } catch (error) {
          debug(`Uncaught exception in windowproc: ${error}`);
        }
      }
    }
    return undefined;
  }

  private dispose(): void {
    const hWnd = this.hWnd;
    if (hWnd != null) {
      debug("Destroying receiver window");
      this.hWnd = null;
      if (!DestroyWindow(hWnd)) {
        throw Error("DestroyWindow() failed");
      }
    }
  }

  private wndProc: CALLBACK;
  private hWnd: HWND;
  private listeners: {receiver: any, condition: MSGCONDITION, callback: MSGCALLBACK}[] = [];
}

export class SendMessageReceiver implements MessageReceiver {
  constructor(condition: MSGCONDITION, callback: MSGCALLBACK) {
    MessageReceiverWindow.instance.addListener(this, condition, callback);
  }

  dispose(): void {
    MessageReceiverWindow.instance.removeListener(this);
  }

  get handle(): HWND {
    return MessageReceiverWindow.instance.handle;
  }

  static get handle(): HWND {
    return MessageReceiverWindow.instance.handle;
  }
}
