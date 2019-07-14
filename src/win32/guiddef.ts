import * as ref from "ref";
import * as refStruct from "ref-struct";
import * as refArray from "ref-array";

export type GUID = {
  data1: number;
  data2: number;
  data3: number;
  data4: number[];
};
export const GUID = refStruct({
  data1: ref.types.uint32,
  data2: ref.types.uint16,
  data3: ref.types.uint16,
  data4: refArray(ref.types.uint8, 8),
});
