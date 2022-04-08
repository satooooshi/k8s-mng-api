import express from "express"
const app = express()
const host = '0.0.0.0'
const port = 3010

import cors from "cors"
app.use(cors());
app.listen(port, host, () => console.log('API is running on '+host+':'+port))

import k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

import request = require('request');
import fetch from 'node-fetch';

import jp = require('jsonpath');


// https://blog.mamansoft.net/2019/06/18/create-api-specification-with-express/
// http://34.146.130.74:3010/spec/#/default/get_hello
// http://honeplus.blog50.fc2.com/blog-entry-164.html
const swaggerUi = require('swagger-ui-express')
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
app.use('/spec', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)))


app.get('/api/svc/listServices', function (req, res) {
    const svcname = req.params.svcname
    //let myapi = new ServiceResourceApi()//'34.146.130.74'
    //return res.send(myapi.serviceDiscovery())
    console.log('serviceDiscovery')
    //console.log(jp.query(cities, '$.items'))
    const opts = {} as request.Options
    kc.applyToRequest(opts)
    //request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/histories?pretty=true`, opts,
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services?pretty=true`, opts,
        (error, response, body) => {
            if (error) {
                console.log(`error: ${error}`);
            }
            if (response) {
                console.log(`statusCode: ${response.statusCode}`);
            }
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
            let bufone=JSON.parse(body)
            let buftwo=bufone.items.map(item=>{
              return {name:item.metadata.name, uid:item.metadata.uid, clusterIP:item.spec.clusterIP, ports:item.spec.ports}
            })
            console.log(JSON.stringify(buftwo, null, 2))
            return res.send(buftwo)
      });
})


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
 *         description: Success, svsname's endpoints ip and port is returned
 */
app.get('/api/svc/serviceDiscovery/:svcname', function (req, res) {
    const svcname = req.params.svcname
    //let myapi = new ServiceResourceApi()//'34.146.130.74'
    //return res.send(myapi.serviceDiscovery())
    console.log('serviceDiscovery')
    //console.log(jp.query(cities, '$.items'))
    const opts = {} as request.Options
    kc.applyToRequest(opts)
    //request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/histories?pretty=true`, opts,
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/${svcname}`, opts,
        (error, response, body) => {
            if (error) {
                console.log(`error: ${error}`);
            }
            if (response) {
                console.log(`statusCode: ${response.statusCode}`);
            }
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
            let item=JSON.parse(body)
            //console.log(JSON.stringify(item, null, 2))
            let addresses=item.subsets[0].addresses.map(addr=>{
              return {ip:addr.ip, uid:addr.targetRef.uid}
            })
            let ports=item.subsets[0].ports
            console.log(JSON.stringify(addresses, null, 2))
            console.log(JSON.stringify(ports, null, 2))
            //return 'heya'
            return res.send({adddresses:addresses,ports:ports})
      });
})

//console.log('Hello TypeScript');
let message: string = 'Hello World';
console.log(message);

import { Person } from './person'
import { ServiceResourceApi } from './serviceResourceApi'

let taro = new Person('Taro', 30, 'Japan')

console.log(taro.name)  // Taro
//console.log(taro.age)  // ageはprivateなのでコンパイルエラー
console.log(taro.profile())  // privateのageを含むメソッドなのでエラーになる
let myapi = new ServiceResourceApi('34.146.130.74')
myapi.serviceDiscoveryTest()

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