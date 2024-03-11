import { create } from 'mutative';
import { produce } from 'immer';
import { createTable, updateTable } from './mockPhysics';

const iterations = 5000;
const ballCount = 30;

let rawTable = createTable(ballCount);
let before = Date.now();
for (let i=0;i<iterations;i++) {
    updateTable(rawTable);
}
let after = Date.now();
console.log("RAW     : " + iterations+" iterations @"+(after-before)+"ms  ("+((after-before) / iterations)+" per loop)");

let rawCopyTable = createTable(ballCount);
before = Date.now();
for (let i=0;i<iterations;i++) {
    rawCopyTable = JSON.parse(JSON.stringify(updateTable(rawCopyTable)));
}
after = Date.now();
console.log("RAW+COPY: " + iterations+" iterations @"+(after-before)+"ms  ("+((after-before) / iterations)+" per loop)");


let mutativeTable = createTable(ballCount);
before = Date.now();
for (let i=0;i<iterations;i++) {
    mutativeTable = create(mutativeTable, (draft) => {
        updateTable(draft);
    });
}
after = Date.now();
console.log("MUTATIVE: " + iterations+" iterations @"+(after-before)+"ms  ("+((after-before) / iterations)+" per loop)");


let immerTable = createTable(ballCount);
before = Date.now();
for (let i=0;i<iterations;i++) {
    immerTable = produce(immerTable, (draft) => {
        updateTable(draft);
    });
}
after = Date.now();
console.log("IMMER   : " + iterations+" iterations @"+(after-before)+"ms  ("+((after-before) / iterations)+" per loop)");

