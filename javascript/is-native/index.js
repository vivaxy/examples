console.log(isNative(console.log));
console.log(isNative(alert));

alert = function (string) {
    console.log(string);
};

console.log(isNative(alert));
