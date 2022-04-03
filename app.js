"use strict";
exports.__esModule = true;
//console.log('Hello TypeScript');
var message = 'Hello World';
console.log(message);
var person_1 = require("./person");
var serviceResourceApi_1 = require("./serviceResourceApi");
var taro = new person_1.Person('Taro', 30, 'Japan');
console.log(taro.name); // Taro
//console.log(taro.age)  // ageはprivateなのでコンパイルエラー
console.log(taro.profile()); // privateのageを含むメソッドなのでエラーになる
var myapi = new serviceResourceApi_1.ServiceResourceApi('34.146.130.74');
myapi.serviceDeploymentRunning();
