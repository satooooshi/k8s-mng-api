import express from "express"
const app = express()
const host = '0.0.0.0'
const port = 3010

import cors from "cors"
app.use(cors());
// Express v4.xでJSONのリクエスト/レスポンスを取得する正しい方法
// https://blog.hrendoh.com/handle-json-requests-and-responses-in-express/ 
// https://stackoverflow.com/questions/24543847/req-body-empty-on-posts
//app.use(express.urlencoded({ extended: true })) //POST (application/x-www-form-urlencoded)
app.use(express.json()) // Content-Type: application/json
// 可変階層のパスをハンドリング
// http://dotnsf.blog.jp/archives/1078520620.html
app.use( function( req, res, next ){
  if( req.url.startsWith( '/api/svc/serviceInvoke/' ) ){
    let params = req.url.substr(23)
    //console.log(params)
    // http://34.146.130.74:3010/api/svc/serviceInvoke/reactfront/hello
    res.redirect( `/api/svc/serviceInvoke?params=${params}`)
  }else{
    // '/api/svc/serviceInvoke' で始まらないパスへのアクセスだった場合はそのまま処理する
    next();
  }
});

app.listen(port, host, () => console.log('API is running on '+host+':'+port))

import k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAppsV1Api = kc.makeApiClient(k8s.AppsV1Api);

import request = require('request');
import fetch from 'node-fetch';

import jp = require('jsonpath');

import multer = require('multer')
const upload = multer({ dest: 'uploads/' })

import {apply} from './apply'


// https://blog.mamansoft.net/2019/06/18/create-api-specification-with-express/
// http://34.146.130.74:3010/spec/#/default/get_hello
// http://honeplus.blog50.fc2.com/blog-entry-164.html
// how to write
// https://qiita.com/oden141/items/8591f47d67dca09cc714
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


app.get('/api/svc/listAllpods', function (req, res) {
  console.log('list all pods')
  k8sCoreApi.listNamespacedPod('default', undefined, undefined, undefined, undefined, 'app=histories').then((response) => {
    // tslint:disable-next-line:no-console
    console.log(response.body.items);
    res.json({'msg':'Got a POST request'});
  });
})


// curl -X POST -H "Content-Type: application/json" -d '{"name":"太郎", "age":"30"}' http://34.146.130.74:3010/api/service/test/service/test
// curl -X POST -F file=@liveness-check.yml http://34.146.130.74:3010/api/svc/serviceDeploymentRunning
app.post('/api/svc/serviceDeploymentRunning', upload.single('file'), function (req, res) {
  console.log('serviceDeploymentRunning')
  console.log('label:app: is needed for service discovery')
  console.log(req.file.filename)
  apply(`uploads/${req.file.filename}`)
  //res.send('Got a POST request')
  // res.jsonメソッドは、ヘッダーにContent-Typeにapplication/jsonを追加、オブジェクトをJSON.stringify()して返してくれます。
  res.json({'msg':`saved file @ uploads/${req.file.filename}`})
})

app.post('/api/svc/serviceRegister', function (req, res) {
  console.log(req.file.filename)
  apply(`uploads/${req.file.filename}`)
  res.json({'msg':`saved file @ uploads/${req.file.filename}`})
})


// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#-strong-write-operations-deployment-v1-apps-strong-
/**
 * @swagger
 * parameters:
 *   svcname:
 *     in: path
 *     name: svcname
 *     description: service name
 *     required: true
 *     type: string
 *   nodelabel:
 *     in: path
 *     name: nodelabel
 *     description: add/delete endpoints from this node
 *     requeired: true
 *     type: string
 */


/**
 * @swagger
 * /api/svc/serviceDiscovery/{svcname}:
 *   get:
 *     tags:
 *      - "Service Resource Management API"
 *     summary: get service's endpoints ip and port
 *     description: get service's endpoints ip and port
 *     parameters:
 *       - $ref: '#/parameters/svcname'
 *     responses:
 *       200:
 *         description: Success, svsname's endpoints ip and port is returned
 */
app.get('/api/svc/healthCheck/:svcname', function (req, res) {
    const svcname = req.params.svcname
    console.log('serviceDiscovery purek8sapi')
    //console.log(jp.query(cities, '$.items'))
    const opts = {} as request.Options
    kc.applyToRequest(opts)
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/${svcname}`, opts,
        (error, response, body) => {
            if (error) {
                console.log(`error: ${error}`);
            }
            if (response) {
                console.log(`statusCode: ${response.statusCode}`);
                            //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
                let item=JSON.parse(body)
                console.log(item)
                let addresses=item.subsets?.[0].addresses.map(addr=>{
                  return addr.ip//{ip:addr.ip, uid:addr.targetRef.uid}
                })
                let ports=item.subsets?.[0].ports
                console.log(addresses)
                //k8sCoreApi.listNamespacedPod('default', undefined, undefined, undefined, undefined, `app=${svcname}`).then((response) => {
                k8sCoreApi.listNamespacedPod('default').then((response) => {
                  // tslint:disable-next-line:no-console
                  console.log(response.body.items.filter(pod=>{
                    for(let i=0;i<addresses.length;i++){
                      if(addresses[i]==pod.status.podIP){
                        return true
                      }
                    }
                    return false
                  }).map(pod=>{
                    return {name:pod.metadata.name, podIP:pod.status.podIP, status:pod.status.phase}
                  }))
                  console.log(JSON.stringify(ports, null, 2))
                  return res.send({
                                    endpoints:  response.body.items.filter(pod=>{
                                      for(let i=0;i<addresses.length;i++){
                                        if(addresses[i]==pod.status.podIP){
                                          return true
                                        }
                                      }
                                      return false
                                    }).map(pod=>{
                                      return {name:pod.metadata.name, podIP:pod.status.podIP, status:pod.status.phase}
                                    }),
                                    port: ports,
                                  })
                });
                
            }

      });
})

// https://stackoverflow.com/questions/49938266/how-to-return-values-from-async-functions-using-async-await-from-function
/**
 * @swagger
 * /api/svc/serviceDiscovery/{svcname}:
 *   get:
 *     tags:
 *      - "Service Resource Management API"
 *     summary: get service's endpoints ip and port
 *     description: get service's endpoints ip and port
 *     parameters:
 *       - $ref: '#/parameters/svcname'
 *     responses:
 *       200:
 *         description: Success, svsname's endpoints ip and port is returned
 */
 app.get('/api/svc/serviceDiscovery/:svcname', async function (req, res) {
  const svcname = req.params.svcname
  console.log('serviceDiscovery')
  const resu= await serviceDiscovery(svcname)
  console.log(resu)
  res.send(resu)
})



// Kubernetes scheduling is simply the process of assigning pods to the matched nodes in a cluster.
// https://thenewstack.io/a-deep-dive-into-kubernetes-scheduling/
// If you want to run your pods on a specific set of nodes, use nodeSelector to ensure that happens. You can define the nodeSelector field as a set of key-value pairs in ‘PodSpec’:
// Node Affinity
// 実際的なユースケース
// Pod間アフィニティとアンチアフィニティは、ReplicaSet、StatefulSet、Deploymentなどのより高レベルなコレクションと併せて使用するとさらに有用です。
// https://kubernetes.io/ja/docs/concepts/scheduling-eviction/assign-pod-node/
app.get('/api/svc/serviceScheduleOnNodes/:svcname/', function (req, res) {
  const svcname = req.params.svcname
  console.log('service schedule')
})

app.get('/api/svc/serviceInvoke', async function (req, res) {
  const params = req.query.params.split( '/' )
  console.log(params)
  const svcname = params[0]
  const path = '/'+params.slice(1).join('/')
  console.log(path)
  console.log('service Invoke')

  // http://34.146.130.74:3010/api/svc/serviceInvoke/customers/api/customers/hello
  const resu= await serviceInvoke(svcname, path)
  console.log(resu)
  res.send(resu)
})

async function serviceDiscovery(svcname:string) {
  const res = await k8sCoreApi.readNamespacedEndpoints(svcname,'default')
  console.log(res.body)
  const subsets = res.body.subsets;
  let addresses=subsets?.[0].addresses.map(addr=>{
    return addr.ip//{ip:addr.ip, uid:addr.targetRef.uid}
  })
  let port=subsets?.[0].ports[0].port
  console.log(addresses) 
  console.log(port)
  return {ips:addresses, port:port}
}

  // https://stackoverflow.com/questions/49938266/how-to-return-values-from-async-functions-using-async-await-from-function
  // https://www.i-ryo.com/entry/2020/06/05/192657?amp=1
async function serviceInvoke(svcname:string, path:string) {
    const connectTo = await serviceDiscovery(svcname)
    console.log(`http://${connectTo.ips[0]}:${connectTo.port}${path}`)
    const res = await fetch(`http://${connectTo.ips[0]}:${connectTo.port}${path}`)
    const json = await res.json()
    return json
}





// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#-strong-write-operations-service-v1-core-strong-
app.get('/api/svc/serviceCancel/:svcname', async function (req, res) {
  const svcname = req.params.svcname
  console.log('service cancel')
  console.log('read service info and delete selectored service and corresponding deployments')

  const doit = async(svcname, namespace)=>{
    const svcdata = await k8sCoreApi.readNamespacedService(svcname, namespace)
    console.log(svcdata.body.spec.selector.app)
    const delSvc = await k8sCoreApi.deleteNamespacedService(svcname, namespace)
    console.log(delSvc)
    const depList = await k8sAppsV1Api.listNamespacedDeployment(namespace)
    console.log(depList.body.items.filter(dep=>dep.spec.selector.matchLabels.app==svcdata.body.spec.selector.app))
    const deps = depList.body.items.filter(dep=>dep.spec.selector.matchLabels.app==svcdata.body.spec.selector.app)
    for(let i=0;i<deps.length;i++){
      const delDep = await k8sAppsV1Api.deleteNamespacedDeployment(deps[i].metadata.name, deps[i].metadata.namespace)
      console.log(delDep)
    }
  }
  doit(svcname, 'default')
})



//console.log('Hello TypeScript');
let message: string = 'Hello World';
console.log(message);

import { Person } from './person'
import { ServiceResourceApi } from './serviceResourceApi'
import { createTrue } from "typescript"

let taro = new Person('Taro', 30, 'Japan')

console.log(taro.name)  // Taro
//console.log(taro.age)  // ageはprivateなのでコンパイルエラー
console.log(taro.profile())  // privateのageを含むメソッドなのでエラーになる
//let myapi = new ServiceResourceApi('34.146.130.74')
//myapi.serviceDiscoveryTest()



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


// delete deployjents
// http://blog.madhukaraphatak.com/understanding-k8s-api-part-3/


// セレクターなしのService
// https://kubernetes.io/ja/docs/concepts/services-networking/service/
// https://qiita.com/kouares/items/94a073baed9dffe86ea0
// 上記のようにmetadataのnameを揃えてService, Endpointsを定義することでセレクタなしServiceに来た通信は、対応するEndpointsの定義にしたがって、10.3.42.250:30050にルーティングされます。
/*
metadata:
  name: my-service
PodセレクターなしでServiceを定義
or
spec:
  selector:
    app: MyApp
これはapp=Myappラベルのついた各Pod上でTCPの9376番ポートをターゲットとします。


deployment側のlabelとsrevice側のselectorを合わせる
metadata:
  name: express-app
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: express

service
metadata:
  name: express-app-svc
spec:
  selector:
    app: express
*/


// cluster ip 指定
// https://cstoku.dev/posts/2018/k8sdojo-09/
// .spec.clusterIP