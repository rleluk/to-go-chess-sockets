import GameTree from './game-tree';

let gt = new GameTree('fen');
let m1 = gt.addMove('1', 'pos');
let m2 = gt.addMove('2', 'pos');
let m3 = gt.addMove('3', 'pos');
let m4 = gt.addMove('4', 'pos');
let m5 = gt.addMove('5', 'pos');
let m6 = gt.addMove('6', 'pos');

gt.setLeaf(m3);
let m7 = gt.addMove('7', 'pos');
let m8 = gt.addMove('8', 'pos');
let m9 = gt.addMove('9', 'pos');

gt.setLeaf(m8);
let m10 = gt.addMove('10', 'pos');
let m11 = gt.addMove('11', 'pos');

console.log(gt.toPGN())

// let result = [];
// gt.traverse(gt.root, result)
// console.log(result)

// gt.setMainRoute(m7);
// result = []
// gt.traverse(gt.root, result)
// console.log(result)

// gt.setMainRoute(m11);
// result = []
// gt.traverse(gt.root, result)
// console.log(result)

