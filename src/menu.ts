import { EventEmitter } from "events";
import { CreatePopupMenu, CreateMenu, DestroyMenu, MenuFlags, TrackPopupMenu, POINT, GetCursorPos, WNDCLASSEXA, CreateWindowExA, HWND_MESSAGE, RegisterClassExA, DefWindowProcA, WindowMessages, AppendMenuW } from "./win32/winuser";
import * as ffi from "ffi";
import { HMENU, HWND, LRESULT, UINT, WPARAM, LPARAM, CALLBACK } from "./win32/windef";

export class Menu extends EventEmitter {
  constructor(handle?: HMENU) {
    super();
    if (handle == null) {
      handle = CreateMenu();
      if (handle == null) {
        throw Error("CreateMenu() failed");
      }
    }
    this.nativeHandle = handle;
  }

  get handle(): HMENU {
    return this.nativeHandle;
  }

  dispose(): void {
    if (!DestroyMenu(this.nativeHandle)) {
      throw Error("DestroyMenu() failed");
    }
    this.nativeHandle = null;
  }

  appendItem(content: string, uFlags: number = 0): MenuItem {
    const id = Menu.nextId;
    if (!AppendMenuW(this.nativeHandle, uFlags | MenuFlags.MF_STRING, id, content)) {
      throw Error("AppendMenuW() failed");
    }
    ++Menu.nextId;
    return new MenuItem(this, id);
  }

  appendSeparator(): MenuItem {
    return this.appendItem(null, MenuFlags.MF_SEPARATOR);
  }

  appendSubMenu(content: string, subMenu: Menu, uFlags: number = 0): Menu {
    if (!AppendMenuW(this.nativeHandle, uFlags | MenuFlags.MF_POPUP | MenuFlags.MF_STRING, subMenu.handle as any, content)) {
      throw Error("AppendMenuW() failed");
    }
    return subMenu;
  }

  protected static createReceiver(): HWND {
    if (this.hWndReceiver != null) {
      return this.hWndReceiver;
    }
    const wcl: WNDCLASSEXA = new WNDCLASSEXA({});
    wcl.cbSize = WNDCLASSEXA.size;
    this.wndProc = ffi.Callback(
      LRESULT, [HWND, UINT, WPARAM, LPARAM],
      (hWnd: HWND, uMsg: UINT, wParam: WPARAM, lParam: LPARAM): LRESULT => {
        if (uMsg === WindowMessages.WM_COMMAND) {
          this.dispatch(wParam, lParam);
        }
        return DefWindowProcA(hWnd, uMsg, wParam, lParam);
      }
    );
    wcl.lpfnWndProc = this.wndProc;
    wcl.lpszClassName = "winhotkey.menu";
    if (RegisterClassExA((wcl as any).ref()) === 0) {
      throw Error("RegisterClassExA() failed");
    }
    this.hWndReceiver = CreateWindowExA(0, wcl.lpszClassName, null, 0, 0, 0, 0, 0, HWND_MESSAGE, null, null, 0);
    return this.hWndReceiver;
  }

  private static dispatch(wParam: WPARAM, lParam: LPARAM): void {
    console.log("menu", wParam, lParam);
  }

  protected nativeHandle: HMENU;
  private static nextId = 1;
  private static menus: Menu[] = [];
  private static hWndReceiver: HWND;
  private static wndProc: CALLBACK;
}

export class PopupMenu extends Menu {
  constructor() {
    const handle = CreatePopupMenu();
    if (handle == null) {
      throw Error("CreatePopupMenu() failed");
    }
    super(handle);
  }

  popup(uFlags: number = 0): void {
    const pt: POINT = new POINT({});
    if (!GetCursorPos((pt as any).ref())) {
      throw Error("GetCursorPos() failed");
    }
    if (!TrackPopupMenu(this.nativeHandle, uFlags, pt.x, pt.y, 0, Menu.createReceiver(), null)) {
      throw Error("TrackPopupMenu() failed");
    }
  }
}

export class MenuItem extends EventEmitter {
  constructor(private parent: Menu, readonly id: number) {
    super();
  }
}
