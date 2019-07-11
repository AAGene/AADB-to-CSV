import {TypeDef, RowDef} from './defs'

export class Field {
    name: string = "";
    value: any;
    type: number;

    constructor(name: string, type: number) {
        this.name = name;
        this.type = type;
    }

    readField(data: Buffer, idx: number, lookupTable: Array<string>) : number{
        let index = idx;
        
        switch (this.type) {
            case TypeDef.INT:
                this.value = data.readInt32LE(idx);
                index += 4;
                break;
            case TypeDef.DOUBLE:
                this.value = data.readDoubleLE(index);
                index += 8;
                break;
            case TypeDef.STRING:
                let isRawString = data.readInt8(index) == 0;
                index++;
                if (!isRawString) {
                    let isNullTermed = data.readInt32LE(index) == -1;
                    if (isNullTermed) {
                        index += 4;
                        let str = "";
                        while (data[index] != 0x0) {
                            str += String.fromCharCode(data[index]);
                            index++;
                        }
                        index++; // 0x00 byte
                        this.value = str;
                        if (lookupTable.indexOf(str) == -1) {
                            lookupTable.push(str);
                        }
                    } else {
                        let pointer = data.readInt32LE(index);
                        index += 4;
                        this.value = lookupTable[pointer];
                    }
                } else {
                    let str = "";
                    while (data[index] != 0x0) {
                        str += String.fromCharCode(data[index]);
                        index++;
                    }
                    index++; // 0x00 byte
                    this.value = str;
                }
                break;
            case TypeDef.BOOL:
                this.value = data.readInt8(index);
                index += 1;
                break;
            default:
                console.error("UNIMPLEMENTED TYPE " + this.type);
                break;
        }

        return index;
    }
}
export class Row {
    fields: Array<Field>;

    constructor() {
        this.fields = new Array();
    }

    static create(fieldTemplate: Array<Field>) : Row {
        let row = new Row();
        for (let field of fieldTemplate) {
            row.fields.push(new Field(field.name, field.type));
        }

        return row;
    }

    read(data: Buffer, idx: number, lookupTable: Array<string>) : number {
        let index = idx;
        for (let field of this.fields) {
            index = field.readField(data, index, lookupTable);
        }

        return index;
    }
}

export class Table {
    rows: Array<Row>;
    columns : Array<Field>;
    name: string;

    constructor(name: string) {
        this.rows = new Array();
        this.columns = new Array();
        this.name = name;
    }

    addField(name: string, type: number) {
        this.columns.push(new Field(name, type));
    }

    read(data: Buffer, idx: number) : number {
        console.log("Parsing " + this.name);
        let lookupTable = new Array<string>();
        let index = idx;
        let shouldAbort = false;
        while (data[index] != RowDef.END_OF_ROWS && !shouldAbort) {
            if (data[index] == RowDef.START_OF_ROW) {
                index++;
                let row = Row.create(this.columns);
                index = row.read(data, index, lookupTable);
                this.rows.push(row);
            } else {
                shouldAbort = true;
                console.log("Error : Row was not properly read. Expected value 100, got " + data[index] + " at index " + index);
            }
        }

        console.log("Read " + this.rows.length + " rows in " + this.name);
        return index;
    }
}
