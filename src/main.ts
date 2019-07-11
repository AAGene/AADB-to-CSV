import fs = require('fs');
import {Table} from './db';
import {TypeDef, RowDef} from './defs'


/* process table & returns meme */
let processTable = (data: Buffer, table: Table, index: number) : number => {
    let idx = index;
    idx = table.read(data, idx);
    console.log("Writing " + table.name + " to csv");
    table.rows.forEach((row) => {
        let str = "";
        row.fields.forEach((field) => {
            str += field.value;
            str += ";";
        });
        str += "\n";
        
        fs.appendFileSync("./export/" + table.name + ".csv", str);
    });

    return idx;
}

let main = () => {
    console.log("Starting db export");
    let config = JSON.parse(fs.readFileSync('./conf/db.json').toString());

    let file = fs.readFileSync("./db/" + config.file);
    let index = 0;

    let tables = Array<Table>();
    config.tables.forEach((tableData: any) => {
        let table = new Table(tableData.name);
        tableData.columns.forEach((column: any) => {
            table.addField(column.name, column.type);
        });
        tables.push(table);
    });

    tables.forEach((table: Table) => {
        index = processTable(file, table, index);
    });
}

main();