import { EventEmitter } from "events";
import { CreatePopupMenu, CreateMenu, DestroyMenu, MenuFlags, TrackPopupMenu, POINT, GetCursorPos, WindowMessages, AppendMenuW } from "./win32/winuser";
import { HMENU } from "./win32/windef";
import { SendMessageReceiver, PostMessageReceiver } from "./messagereceiver";

export class Menu extends EventEmitter {
  constructor(handle?: HMENU) {
    super();
    if (handle == null) {
      handle = CreateMenu();
      if (handle == null) {
        throw Error("CreateMenu() failed");
      }
    }
    this.hMenu = handle;
  }

  get handle(): HMENU {
    return this.hMenu;
  }

  dispose(): void {
    if (!DestroyMenu(this.hMenu)) {
      throw Error("DestroyMenu() failed");
    }
    this.hMenu = null;
  }

  appendItem(content: string, uFlags: number = 0): MenuItem {
    const id = Menu.nextId;
    if (!AppendMenuW(this.hMenu, uFlags | MenuFlags.MF_STRING, id, content)) {
      throw Error("AppendMenuW() failed");
    }
    ++Menu.nextId;
    return new MenuItem(this, id);
  }

  appendSeparator(): MenuItem {
    return this.appendItem(null, MenuFlags.MF_SEPARATOR);
  }

  appendSubMenu(content: string, subMenu: Menu, uFlags: number = 0): Menu {
    if (!AppendMenuW(this.hMenu, uFlags | MenuFlags.MF_POPUP | MenuFlags.MF_STRING, subMenu.handle as any, content)) {
      throw Error("AppendMenuW() failed");
    }
    return subMenu;
  }

  protected hMenu: HMENU;
  private static nextId = 1;
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
    if (!TrackPopupMenu(this.hMenu, uFlags, pt.x, pt.y, 0, SendMessageReceiver.handle, null)) {
      throw Error("TrackPopupMenu() failed");
    }
  }
}

export class MenuItem extends EventEmitter {
  constructor(private parent: Menu, readonly id: number) {
    super();
    this.receiver = new PostMessageReceiver({
      uMsg: WindowMessages.WM_COMMAND,
      wParam: id,
    }, (msg) => {
      this.emit("command");
    });
  }

  dispose(): void {
    if (this.receiver != null) {
      this.receiver.dispose();
      this.receiver = null;
    }
  }

  protected receiver: PostMessageReceiver;
}
