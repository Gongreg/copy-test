import { create } from 'mutative';
import { produce } from 'immer';
import { createTable, updateTable } from './mockPhysics';

const iterations = 5000;
const ballCount = 30;
const readOnly = true;

console.log(new Date());
console.log("Iterations="+iterations+" Balls="+ballCount+" ReadOnly="+readOnly);
console.log();
let rawTable = createTable(ballCount);
let before = Date.now();
for (let i=0;i<iterations;i++) {
    updateTable(rawTable, readOnly);
}
let after = Date.now();
console.log("RAW     : " + iterations+" iterations @"+(after-before)+"ms  ("+((after-before) / iterations)+" per loop)");

let rawCopyTable = createTable(ballCount);
before = Date.now();
for (let i=0;i<iterations;i++) {
    rawCopyTable = JSON.parse(JSON.stringify(updateTable(rawCopyTable, readOnly)));
}
after = Date.now();
console.log("RAW+COPY: " + iterations+" iterations @"+(after-before)+"ms  ("+((after-before) / iterations)+" per loop)");


let mutativeTable = createTable(ballCount);
before = Date.now();
for (let i=0;i<iterations;i++) {
    const beforeTable = mutativeTable;
    mutativeTable = create(mutativeTable, (draft) => {
        updateTable(draft, readOnly);
    });
    if (beforeTable !== mutativeTable && readOnly) {
        console.log("ERROR - change detected");
        process.exit(0);
    }
}
after = Date.now();
console.log("MUTATIVE: " + iterations+" iterations @"+(after-before)+"ms  ("+((after-before) / iterations)+" per loop)");


let immerTable = createTable(ballCount);
before = Date.now();
for (let i=0;i<iterations;i++) {
    const beforeTable = immerTable;
    immerTable = produce(immerTable, (draft) => {
        updateTable(draft, readOnly);
    });
    if (beforeTable !== immerTable && readOnly) {
        console.log("ERROR - change detected");
        process.exit(0);
    }
}
after = Date.now();
console.log("IMMER   : " + iterations+" iterations @"+(after-before)+"ms  ("+((after-before) / iterations)+" per loop)");

