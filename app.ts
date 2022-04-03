//console.log('Hello TypeScript');
let message: string = 'Hello World';
console.log(message);

import { Person } from './person'
import { ServiceResourceApi } from './serviceResourceApi'

let taro = new Person('Taro', 30, 'Japan')

console.log(taro.name)  // Taro
//console.log(taro.age)  // ageはprivateなのでコンパイルエラー
console.log(taro.profile())  // privateのageを含むメソッドなのでエラーになる

let myapi = new ServiceResourceApi('34.146.130.74');
myapi.serviceDiscovery()