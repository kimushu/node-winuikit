import { EventEmitter } from "events";
import { MSG, UnregisterHotKey, RegisterHotKey, Modifiers, WindowMessages } from "./win32/winuser";
import { MessageReceiver, PostMessageReceiver } from "./messagereceiver";

const KEY2VK = {
  back: 8,
  backspace: 8,
  tab: 9,
  enter: 13,
  escape: 27,
  space: 32,
  pageup: 33,
  pgup: 33,
  pagedown: 34,
  pgdn: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  delete: 46,
};

class KeyCode {
  static parse(key: string): KeyCode {
    let mod = 0;
    key = key.toLowerCase();
    key = key.replace(/^(win|ctrl|shift|alt)\+/g, (prefix) => {
      switch (prefix) {
        case "win+": mod |= Modifiers.MOD_WIN; break;
        case "ctrl+": mod |= Modifiers.MOD_CONTROL; break;
        case "shift+": mod |= Modifiers.MOD_SHIFT; break;
        case "alt+": mod |= Modifiers.MOD_ALT; break;
      }
      return "";
    });
    let vk: number = null;
    let match: RegExpMatchArray;
    if (match = key.match(/^([0-9a-z])$/)) {
      // Digits or alphabets
      vk = match[1].toUpperCase().charCodeAt(0);
    } else if (match = key.match(/^f(\d\d?)$/)) {
      // Function keys
      vk = parseInt(match[1]) - 1 + 0x70;
    } else if (match = key.match(/^numpad(\d)$/)) {
      // Numpad keys
      vk = parseInt(match[1]) + 0x60;
    } else {
      // Other keys
      vk = KEY2VK[key];
    }
    if (vk == null) {
      throw Error(`Unknown key: ${key}`);
    }
    return new KeyCode(mod, vk);
  }

  toString(): string {
    let result = "";
    const { mod, vk } = this;
    if (mod & Modifiers.MOD_WIN) { result += "Win+"; }
    if (mod & Modifiers.MOD_CONTROL) { result += "Ctrl+"; }
    if (mod & Modifiers.MOD_SHIFT) { result += "Shift+"; }
    if (mod & Modifiers.MOD_ALT) { result += "Alt+"; }
    if (((0x30 <= vk) && (vk <= 0x39)) ||
      ((0x41 <= vk) && (vk <= 0x5a))) {
      result += String.fromCharCode(vk);
    } else if ((0x60 <= vk) && (vk <= 0x69)) {
      result += `Numpad${vk - 0x60}`;
    } else if ((0x70 <= vk) && (vk <= 0x87)) {
      result += `F${vk - 0x70}`;
    } else {
      result += "(unknown)";
    }
    return result;
  }

  private constructor(readonly mod: number, readonly vk: number) {
  }
}

export class HotKey extends EventEmitter {
  readonly id: number;
  readonly keyCode: KeyCode;

  /**
   * Construct HotKey object from KeyCode object
   * @param keyCode Key code
   */
  constructor(keyCode: KeyCode);

  /**
   * Construct Hotkey object from key combination string
   * @param key Key combination string
   */
  constructor(key: string);

  constructor(keyOrKeyCode: any) {
    super();
    if (keyOrKeyCode instanceof KeyCode) {
      this.keyCode = keyOrKeyCode;
    } else {
      this.keyCode = KeyCode.parse(keyOrKeyCode);
    }
    this.id = new.target.nextId;
    this.receiver = new PostMessageReceiver({
      uMsg: WindowMessages.WM_HOTKEY,
      wParam: this.id,
    }, (msg: MSG) => {
      this.emit("pressed");
    });
    if (!RegisterHotKey(null, this.id, this.keyCode.mod, this.keyCode.vk)) {
      throw Error("RegisterHotKey failed");
    }
    console.debug(`Registered hotkey (keyCode: "${this.keyCode}", id: ${this.id})`);
    ++new.target.nextId;
  }

  /**
   * Block event listening
   */
  block(): void {
    this.isBlocked = true;
  }

  /**
   * Unblock event listening
   */
  unblock(): void {
    this.isBlocked = false;
  }

  get blocked(): boolean {
    return this.isBlocked;
  }

  /**
   * Unregister hotkey
   */
  unregister(): void {
    this.dispose();
  }

  dispose(): void {
    if (this.receiver != null) {
      this.receiver.dispose();
      this.receiver = null;
    }
    if (this.id != null) {
      if (!UnregisterHotKey(null, this.id)) {
        throw Error("UnregisterHotKey failed");
      }
    }
    this.block();
  }
  private isBlocked = false;
  private receiver: MessageReceiver;
  private static nextId = 1;
}
