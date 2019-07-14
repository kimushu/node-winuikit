import * as ref from "ref";
import { LoadImageA } from "./win32/winuser";
import { HINSTANCE, HANDLE } from "./win32/windef";

export class Image {
  protected constructor(hInst: HINSTANCE, name: string, type: number, cx: number, cy: number, fuLoad: number) {
    this.nativeHandle = LoadImageA(hInst, name, type, cx, cy, fuLoad);
    if (this.nativeHandle == null) {
      throw Error(`LoadImageA(${hInst}, ${name}, ${type}, ${cx}, ${cy}, ${fuLoad}) failed`);
    }
  }

  get handle(): HANDLE {
    return this.nativeHandle;
  }

  dispose(): void {
    if (this.deleter) {
      this.deleter(this.nativeHandle);
    }
    this.nativeHandle = null;
  }

  protected nativeHandle: HANDLE;
  protected deleter: (handle: HANDLE) => any;
}
