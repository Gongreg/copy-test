import { copy } from "fastest-json-copy";
import fastCopy from "fast-copy";

import { createData } from "./data";
var cloneDeep = require("lodash.clonedeep");
const formatMemoryUsage = (data: number) =>
  `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

const test = parseInt(process.argv[2], 10);

const iterations = 100;
const ballCount = 20;

const data = createData(ballCount);

const size = JSON.stringify(data).length / 1024;

let min = Infinity;
let max = -Infinity;

let entries: number[] = [];

function runTests(name: string, testFn: () => void) {
  for (let i = 0; i < iterations; i++) {
    let before = performance.now();
    testFn();
    let after = performance.now();

    const diff = after - before;

    if (diff > max) {
      max = diff;
    }

    if (diff < min) {
      min = diff;
    }

    entries.push(after - before);
  }

  const avg = entries.reduce((a, b) => a + b, 0) / entries.length;
  const median = entries.sort((a, b) => a - b)[Math.floor(entries.length / 2)];

  const stddev = Math.sqrt(
    entries.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / entries.length,
  );

  require("fs").appendFileSync(
    "./results.csv",
    `${name},${size},${avg},${median},${min},${max}\n`,
  );
}

if (test === 1) {
  const x = JSON.stringify(data);
  runTests("json parse", () => {
    JSON.parse(x);
  });
}

if (test === 2) {
  runTests("json stringify", () => {
    JSON.stringify(data);
  });
}

if (test === 3) {
  runTests("json parse + stringify", () => {
    JSON.parse(JSON.stringify(data));
  });
}

if (test === 4) {
  runTests("structuredClone", () => {
    structuredClone(data);
  });
}

if (test === 5) {
  runTests("fastest-json-copy", () => {
    copy(data);
  });
}

if (test === 6) {
  runTests("fast-json-copy", () => {
    fastCopy(data);
  });
}

if (test === 7) {
  runTests("lodash clone deep", () => {
    cloneDeep(data);
  });
}

// const memoryData = process.memoryUsage();
//
// const memoryUsage = {
//   rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
//   heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
//   heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
//   external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
// };

// console.log(memoryUsage);
