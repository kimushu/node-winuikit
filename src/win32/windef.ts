import * as ref from "ref";
import * as nodeBuffer from "buffer";

/**
 * Typedefs
 */

export type INT_PTR = number;     export const INT_PTR = (process.arch === "x64" ? ref.types.int64 : ref.types.int32);
export type UINT_PTR = number;    export const UINT_PTR = (process.arch === "x64" ? ref.types.uint64 : ref.types.uint32);
export type LONG_PTR = INT_PTR;   export const LONG_PTR = INT_PTR;
export type ULONG_PTR = UINT_PTR; export const ULONG_PTR = UINT_PTR;

export type DWORD = number;       export const DWORD = ref.types.uint32;
export type BOOL = boolean;       export const BOOL = ref.types.bool;
export type BYTE = number;        export const BYTE = ref.types.uint8;
export type WORD = number;        export const WORD = ref.types.uint16;
export type LPVOID = ref.Type|0;  export const LPVOID = ULONG_PTR;

export type INT = number;         export const INT = ref.types.int32;
export type UINT = number;        export const UINT = ref.types.uint32;

export type WPARAM = UINT_PTR;    export const WPARAM = UINT_PTR;
export type LPARAM = LONG_PTR;    export const LPARAM = LONG_PTR;
export type LRESULT = LONG_PTR;   export const LRESULT = LONG_PTR;

export type HANDLE = {__HANDLE_TYPE__: number};
export const HANDLE = ref.refType(ref.types.void);

export type ATOM = WORD;          export const ATOM = WORD;

export type HINSTANCE = HANDLE;   export const HINSTANCE = HANDLE;
export type HWND = HANDLE;        export const HWND = HANDLE;
export type HBITMAP = HANDLE;     export const HBITMAP = HANDLE;
export type HBRUSH = HANDLE;      export const HBRUSH = HANDLE;
export type HICON = HANDLE;       export const HICON = HANDLE;
export type HMENU = HANDLE;       export const HMENU = HANDLE;
export type HCURSOR = HANDLE;     export const HCURSOR = HANDLE;

export type LONG = number;        export const LONG = ref.types.int32;
export type ULONG = number;       export const ULONG = ref.types.uint32;
export type LPSTR = string;       export const LPSTR = ref.types.CString;
export type LPCSTR = LPSTR;       export const LPCSTR = LPSTR;

export type CALLBACK = Buffer;    export const CALLBACK = ref.refType(ref.types.void);

export type LPWSTR = string;
export const LPWSTR: ref.Type & {type: ref.Type} = {
  indirection: 1,
  size: ref.NULL_POINTER.length,
  get: (buffer, offset) => {
    const buf = (buffer as any).readPointer(offset);
    return buf.isNull() ? null : buf.readCString(0);
  },
  set: (buffer, offset, value: string) => {
    const buf = Buffer.alloc(Buffer.byteLength(value, "ucs2") + 2);
    buf.write(value, "ucs2");
    return (buffer as any).writePointer(buf, offset);
  },
  type: ref.types.CString,
};
export type LPCWSTR = LPWSTR;     export const LPCWSTR = LPWSTR;

export type STRBUF<N> = string;
export function STRBUF(chars: number): ref.Type & {type: ref.Type} {
  return {
    indirection: 1,
    size: chars,
    get: (buffer, offset) => {
      return (buffer as any).readCString(offset);
    },
    set: (buffer, offset, value: string) => {
      buffer.fill(0, offset);
      buffer.write(value, offset);
    },
    type: ref.types.CString,
  };
}

export type WSTRBUF<N> = string;
export function WSTRBUF(chars: number): ref.Type & {type: ref.Type} {
  return {
    indirection: 1,
    size: 2 * chars,
    get: (buffer, offset) => {
      let length = offset;
      for (; length < (buffer.length - 1); length += 2) {
        if (buffer.readUInt16LE(length) === 0) {
          break;
        }
      }
      return nodeBuffer.transcode(buffer.slice(offset, length), "ucs2", "utf8").toString();
    },
    set: (buffer, offset, value: string) => {
      buffer.fill(0, offset);
      buffer.write(value, offset, "ucs2");
    },
    alignment: 2,
    type: ref.types.CString,
  };
}
