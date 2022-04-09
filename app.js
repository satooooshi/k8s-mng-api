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
// Express v4.xでJSONのリクエスト/レスポンスを取得する正しい方法
// https://blog.hrendoh.com/handle-json-requests-and-responses-in-express/ 
// https://stackoverflow.com/questions/24543847/req-body-empty-on-posts
//app.use(express.urlencoded({ extended: true })) //POST (application/x-www-form-urlencoded)
app.use(express_1.default.json()); // Content-Type: application/json
app.listen(port, host, () => console.log('API is running on ' + host + ':' + port));
const k8s = require("@kubernetes/client-node");
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const request = require("request");
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });
const apply_1 = require("./apply");
// https://blog.mamansoft.net/2019/06/18/create-api-specification-with-express/
// http://34.146.130.74:3010/spec/#/default/get_hello
// http://honeplus.blog50.fc2.com/blog-entry-164.html
// how to write
// https://qiita.com/oden141/items/8591f47d67dca09cc714
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
app.get('/api/svc/listAllpods', function (req, res) {
    console.log('list all pods');
    k8sApi.listNamespacedPod('default', undefined, undefined, undefined, undefined, 'app=histories').then((response) => {
        // tslint:disable-next-line:no-console
        console.log(response.body.items);
    });
});
app.get('/api/svc/listServices', function (req, res) {
    const svcname = req.params.svcname;
    //let myapi = new ServiceResourceApi()//'34.146.130.74'
    //return res.send(myapi.serviceDiscovery())
    console.log('listService');
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
            let buf = JSON.parse(body).items.map(item => {
                return { name: item.metadata.name, uid: item.metadata.uid, clusterIP: item.spec.clusterIP, ports: item.spec.ports };
            });
            console.log(JSON.stringify(buf, null, 2));
            return res.send(buf);
        }
    });
});
// curl -X POST -H "Content-Type: application/json" -d '{"name":"太郎", "age":"30"}' http://34.146.130.74:3010/api/service/test/service/test
// curl -X POST -F file=@person.js http://34.146.130.74:3010/api/service/test
app.post('/api/service/test', function (req, res) {
    console.log(req);
    //res.send('Got a POST request')
    // res.jsonメソッドは、ヘッダーにContent-Typeにapplication/jsonを追加、オブジェクトをJSON.stringify()して返してくれます。
    res.json({ 'msg': 'Got a POST request' });
});
// curl -X POST -H "Content-Type: application/json" -d '{"name":"太郎", "age":"30"}' http://34.146.130.74:3010/api/service/test/service/test
// curl -X POST -F file=@liveness-check.yml http://34.146.130.74:3010/api/svc/serviceDeploymentRunning
app.post('/api/svc/serviceDeploymentRunning', upload.single('file'), function (req, res) {
    //console.log(req)
    console.log(req.file.filename);
    (0, apply_1.apply)(`uploads/${req.file.filename}`);
    //res.send('Got a POST request')
    // res.jsonメソッドは、ヘッダーにContent-Typeにapplication/jsonを追加、オブジェクトをJSON.stringify()して返してくれます。
    res.json({ 'msg': `saved file @ uploads/${req.file.filename}` });
});
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
app.get('/api/svc/serviceDiscovery/:svcname', function (req, res) {
    const svcname = req.params.svcname;
    console.log('serviceDiscovery');
    //console.log(jp.query(cities, '$.items'))
    const opts = {};
    kc.applyToRequest(opts);
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/${svcname}`, opts, (error, response, body) => {
        if (error) {
            console.log(`error: ${error}`);
        }
        if (response) {
            console.log(`statusCode: ${response.statusCode}`);
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
            let item = JSON.parse(body);
            console.log(item);
            let addresses = item.subsets[0].addresses.map(addr => {
                return addr.ip; //{ip:addr.ip, uid:addr.targetRef.uid}
            });
            let ports = item.subsets[0].ports;
            console.log(addresses);
            //k8sApi.listNamespacedPod('default', undefined, undefined, undefined, undefined, `app=${svcname}`).then((response) => {
            k8sApi.listNamespacedPod('default').then((response) => {
                // tslint:disable-next-line:no-console
                console.log(response.body.items.filter(pod => {
                    for (let i = 0; i < addresses.length; i++) {
                        if (addresses[i] == pod.status.podIP) {
                            return true;
                        }
                    }
                    return false;
                }).map(pod => {
                    return { name: pod.metadata.name, podIP: pod.status.podIP, status: pod.status.phase };
                }));
                console.log(JSON.stringify(ports, null, 2));
                return res.send({
                    endpoints: response.body.items.filter(pod => {
                        for (let i = 0; i < addresses.length; i++) {
                            if (addresses[i] == pod.status.podIP) {
                                return true;
                            }
                        }
                        return false;
                    }).map(pod => {
                        return { name: pod.metadata.name, podIP: pod.status.podIP, status: pod.status.phase };
                    }),
                    port: ports,
                });
            });
        }
    });
});
/**
 * @swagger
 * /api/svc/healthCheck/{svcname}:
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
    const svcname = req.params.svcname;
    console.log('healthCheck');
    const opts = {};
    kc.applyToRequest(opts);
    let name = 'histories-664b4d6b8d-cvxc7';
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/pods/${name}/status`, opts, (error, response, body) => {
        if (error) {
            console.log(`error: ${error}`);
        }
        if (response) {
            console.log(`statusCode: ${response.statusCode}`);
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
            console.log(JSON.parse(body));
        }
    });
});
// https://kubernetes.io/ja/docs/concepts/scheduling-eviction/assign-pod-node/
// Node上へのPodのスケジューリング
/**
 * @swagger
 * /api/svc/serviceSchedule/{svcname}/{nodelabel}:
 *   get:
 *     tags:
 *      - "Service Resource Management API"
 *     summary: get service's endpoints ip and port
 *     description: get service's endpoints ip and port
 *     parameters:
 *       - $ref: '#/parameters/svcname'
 *       - $ref: '#/parameters/nodelabel'
 *     responses:
 *       200:
 *         description: Success, svsname's endpoints ip and port is returned
 */
app.get('/api/svc/serviceSchedule/:svcname/:nodelabel', function (req, res) {
    const svcname = req.params.svcname;
    console.log('serviceSchedule');
});
/**
 * @swagger
 * /api/svc/serviceCancel/{svcname}:
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
app.get('/api/svc/serviceCanceltest/:svcname', function (req, res) {
    const svcname = req.params.svcname;
    console.log('service cancel');
    //console.log(jp.query(cities, '$.items'))
    const opts = {};
    kc.applyToRequest(opts);
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/${svcname}`, opts, (error, response, body) => {
        if (error) {
            console.log(`error: ${error}`);
        }
        if (response) {
            console.log(`statusCode: ${response.statusCode}`);
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
            let item = JSON.parse(body);
            console.log(item);
            let addresses = item.subsets[0].addresses.map(addr => {
                return addr.ip; //{ip:addr.ip, uid:addr.targetRef.uid}
            });
            let ports = item.subsets[0].ports;
            console.log(addresses);
            //k8sApi.listNamespacedPod('default', undefined, undefined, undefined, undefined, `app=${svcname}`).then((response) => {
            k8sApi.listNamespacedPod('default').then((response) => {
                // tslint:disable-next-line:no-console
                let deletingPods = response.body.items.filter(pod => {
                    for (let i = 0; i < addresses.length; i++) {
                        if (addresses[i] == pod.status.podIP) {
                            return true;
                        }
                    }
                    return false;
                }).map(pod => {
                    return pod.metadata.name;
                });
                console.log(deletingPods);
                deletingPods.forEach(podName => {
                    //deletePod(pod,'defalut')
                    k8sApi.deleteNamespacedPod(podName, 'default');
                });
                return res.send(deletingPods);
            });
        }
    });
});
// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#-strong-write-operations-service-v1-core-strong-
// /api/v1/namespaces/{namespace}/services/{name}
app.get('/api/svc/serviceCancel/:svcname', function (req, res) {
    const svcname = req.params.svcname;
    console.log('service cancel');
    //console.log(jp.query(cities, '$.items'))
    const opts = {};
    kc.applyToRequest(opts);
    request.delete(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/${svcname}`, opts, (error, response, body) => {
        if (error) {
            console.log(`error: ${error}`);
        }
        if (response) {
            console.log(`statusCode: ${response.statusCode}`);
            console.log(body);
        }
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
// delete deployjents
// http://blog.madhukaraphatak.com/understanding-k8s-api-part-3/
