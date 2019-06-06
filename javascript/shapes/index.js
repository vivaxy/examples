/**
 * @since 2019-06-06 10:47
 * @author vivaxy
 */
let a = {x:1, y:2, z:3};

let b = {};
b.x = 1;
b.y = 2;
b.z = 3;

console.log("a and b have same map:", %HaveSameMap(a, b));

a = {x:1,y:2,z:3};
b = {x: 100, y: 200, z: 300};
console.log("a and b have same map:", %HaveSameMap(a, b));

a = {};
a.x = 1;
a.y = 2;
a.z = 3;

b = {};
b.x = 100;
b.y = 200;
b.z = 200;
console.log("a and b have same map:", %HaveSameMap(a, b));
