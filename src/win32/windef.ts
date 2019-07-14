import * as ref from "ref";

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
export type LPCSTR = string;      export const LPCSTR = ref.types.CString;

export type CALLBACK = Buffer;    export const CALLBACK = ref.refType(ref.types.void);

export type UCS2STR = string;
export const UCS2STR = {
  indirection: 1,
  size: ref.NULL_POINTER.length,
  get: (buffer: Buffer, offset: number) => {
    const buf = (buffer as any).readPointer(offset);
    return buf.isNull() ? null : buf.readCString(0);
  },
  set: (buffer: Buffer, offset: number, value: string) => {
    const buf = Buffer.alloc(Buffer.byteLength(value, "ucs2") + 2);
    buf.write(value, "ucs2");
    return (buffer as any).writePointer(buf, offset);
  },
  type: ref.types.CString
};
