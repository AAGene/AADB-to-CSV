export namespace RowDef {
    export const START_OF_ROW: number = 0x64;
    export const END_OF_ROWS: number = 0x65;
}

export namespace TypeDef {
    export const STRING = 0x01;
    export const BOOL = 0x02;
    export const COLOR = 0x03;
    export const INT = 0x04;
    export const TIMESTAMP = 0x05;
    export const DOUBLE = 0x08;
    export const BLOB = 0x80;
}