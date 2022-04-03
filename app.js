"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//console.log('Hello TypeScript');
let message = 'Hello World';
console.log(message);
const person_1 = require("./person");
const serviceResourceApi_1 = require("./serviceResourceApi");
let taro = new person_1.Person('Taro', 30, 'Japan');
console.log(taro.name); // Taro
//console.log(taro.age)  // ageはprivateなのでコンパイルエラー
console.log(taro.profile()); // privateのageを含むメソッドなのでエラーになる
let myapi = new serviceResourceApi_1.ServiceResourceApi('34.146.130.74');
myapi.serviceDiscovery();
