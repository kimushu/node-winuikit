import { Image } from "./image";
import { ImageType, LoadResourceFlags, DestroyIcon } from "./win32/winuser";
import { HINSTANCE } from "./win32/windef";

export class Icon extends Image {
  static loadFromFile(path: string, flags: number = LoadResourceFlags.LR_DEFAULTSIZE): Icon {
    return new Icon(null, path, 0, 0, LoadResourceFlags.LR_LOADFROMFILE | flags);
  }

  protected constructor(hInst: HINSTANCE, name: string, cx: number, cy: number, fuLoad: number) {
    super(hInst, name, ImageType.IMAGE_ICON, cx, cy, fuLoad);
    this.deleter = DestroyIcon;
  }
}
