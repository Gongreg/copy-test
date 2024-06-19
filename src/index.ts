import { create } from "mutative";
import { createTable, updateTable } from "./mockPhysics";

const formatMemoryUsage = (data: number) =>
  `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;

const test = parseInt(process.argv[2], 10);

const iterations = 100;
const ballCount = 500;

const data = createTable(ballCount);

console.log("DATA size in kb", JSON.stringify(data).length / 1024);

let prev = data;

let last3Copies: any[] = [];

let trackChanges = false;

function runTests(name: string, testFn: () => void) {
  prev = data;

  let before = performance.now();
  for (let i = 0; i < iterations; i++) {
    testFn();
  }

  let after = performance.now();
  console.log(
    `${name}: ` +
      iterations +
      " iterations @" +
      (after - before) +
      "ms  (" +
      (after - before) / iterations +
      " per loop)",
  );
}

console.log(new Date());
console.log("Iterations=" + iterations + " Balls=" + ballCount);

if (test === 1) {
  runTests("RAW", () => {
    let first = updateTable(prev);
    let second = updateTable(first);
    let third = updateTable(second);
    prev = first;
    last3Copies = [prev, last3Copies[0], last3Copies[1]];
  });
}

if (test === 2) {
  runTests("RAW+COPY", () => {
    let first = JSON.parse(JSON.stringify(updateTable(prev)));
    let second = JSON.parse(JSON.stringify(updateTable(first)));
    let third = JSON.parse(JSON.stringify(updateTable(second)));

    prev = first;
    last3Copies = [prev, last3Copies[0], last3Copies[1]];
  });
}

if (test === 3) {
  runTests("MUTATIVE", () => {
    let first = create(prev, (draft) => {
      updateTable(draft);
    });
    let second = create(first, (draft) => {
      updateTable(draft);
    });
    let third = create(second, (draft) => {
      updateTable(draft);
    });

    prev = first;
    last3Copies = [prev, last3Copies[0], last3Copies[1]];
  });
}

let changes: [any, string, any][] = [];
// This function handles arrays and objects
function eachRecursive(obj: any) {
  for (var k in obj) {
    if (k.startsWith("_")) {
      continue;
    }
    if (typeof obj[k] == "object" && obj[k] !== null) eachRecursive(obj[k]);
    else {
      obj[`_${k}`] = obj[k];
      Object.defineProperty(obj, k, {
        get: function () {
          return obj[`_${k}`];
        },
        set: function (value: any) {
          if (trackChanges) {
            changes.push([obj, k, obj[`_${k}`]]);
          }
          obj[`_${k}`] = value;
        },
      });
    }
    // do something...
  }

  return obj;
}

const newData = eachRecursive(data);

function undoChanges() {
  trackChanges = false;
  for (let i = changes.length - 1; i >= 0; i--) {
    const [obj, key, value] = changes[i];
    obj[key] = value;
  }

  trackChanges = true;

  changes = [];

  return;
}

if (test === 4) {
  runTests("GETTER/SETTER", () => {
    const first = updateTable(newData);
    const second = updateTable(first);
    const third = updateTable(second);

    undoChanges();

    prev = third;
    last3Copies = [prev, last3Copies[0], last3Copies[1]];
  });
}

const memoryData = process.memoryUsage();

const memoryUsage = {
  rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
  heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
  heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
  external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
};

console.log(memoryUsage);
