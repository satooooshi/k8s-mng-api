"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const host = '0.0.0.0';
const port = 3010;
const cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)());
app.listen(port, host, () => console.log('API is running on ' + host + ':' + port));
const k8s = require("@kubernetes/client-node");
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const request = require("request");
// https://blog.mamansoft.net/2019/06/18/create-api-specification-with-express/
// http://34.146.130.74:3010/spec/#/default/get_hello
// http://honeplus.blog50.fc2.com/blog-entry-164.html
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const options = {
    swaggerDefinition: {
        info: {
            title: 'Service Resource Management API',
            version: '1.0.0'
        },
    },
    apis: ['./app.js'],
};
app.use('/spec', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));
app.get('/api/svc/listServices', function (req, res) {
    const svcname = req.params.svcname;
    //let myapi = new ServiceResourceApi()//'34.146.130.74'
    //return res.send(myapi.serviceDiscovery())
    console.log('serviceDiscovery');
    //console.log(jp.query(cities, '$.items'))
    const opts = {};
    kc.applyToRequest(opts);
    //request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/histories?pretty=true`, opts,
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services?pretty=true`, opts, (error, response, body) => {
        if (error) {
            console.log(`error: ${error}`);
        }
        if (response) {
            console.log(`statusCode: ${response.statusCode}`);
        }
        //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
        let bufone = JSON.parse(body);
        let buftwo = bufone.items.map(item => {
            return { name: item.metadata.name, uid: item.metadata.uid, clusterIP: item.spec.clusterIP, ports: item.spec.ports };
        });
        console.log(JSON.stringify(buftwo, null, 2));
        return res.send(buftwo);
    });
});
/**
 * @swagger
 * parameters:
 *   svcname:
 *     in: path
 *     name: svcname
 *     description: service name
 *     required: true
 *     type: string
 */
/**
 * @swagger
 * /api/svc/serviceDiscovery/{svcname}:
 *   get:
 *     summary: get service's endpoints ip and port
 *     description: get service's endpoints ip and port
 *     parameters:
 *       - $ref: '#/parameters/svcname'
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/svc/serviceDiscovery/:svcname', function (req, res) {
    const svcname = req.params.svcname;
    //let myapi = new ServiceResourceApi()//'34.146.130.74'
    //return res.send(myapi.serviceDiscovery())
    console.log('serviceDiscovery');
    //console.log(jp.query(cities, '$.items'))
    const opts = {};
    kc.applyToRequest(opts);
    //request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/histories?pretty=true`, opts,
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/${svcname}`, opts, (error, response, body) => {
        if (error) {
            console.log(`error: ${error}`);
        }
        if (response) {
            console.log(`statusCode: ${response.statusCode}`);
        }
        //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
        let item = JSON.parse(body);
        //console.log(JSON.stringify(item, null, 2))
        let addresses = item.subsets[0].addresses.map(addr => {
            return { ip: addr.ip, uid: addr.targetRef.uid };
        });
        let ports = item.subsets[0].ports;
        console.log(JSON.stringify(addresses, null, 2));
        console.log(JSON.stringify(ports, null, 2));
        //return 'heya'
        return res.send({ adddresses: addresses, ports: ports });
    });
});
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
myapi.serviceDiscoveryTest();
//myapi.healthCheck()
// https://kubernetes.io/docs/reference/kubectl/jsonpath/
// json path 
// npx tsc && node app.js
// http://jsonpath.com/
// JSONPath 使い方まとめ
// https://qiita.com/takkii1010/items/0ce1c834d3a73496ccef
//  stringify() は、JavaScriptオブジェクトを取得し、JSON 文字列に変換します
// parse() ha translate into object now can be accessed as item.kind...
// $.subsets[*].addresses[*].ip
