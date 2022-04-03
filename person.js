"use strict";
exports.__esModule = true;
exports.Person = void 0;
var Person = /** @class */ (function () {
    function Person(name, age, nationality) {
        this.name = name;
        this.age = age;
        this.nationality = nationality;
    }
    Person.prototype.profile = function () {
        // ageはprivateなのでクラス内部のみアクセスできる
        return "name: ".concat(this.name, " age: ").concat(this.age);
    };
    return Person;
}());
exports.Person = Person;
