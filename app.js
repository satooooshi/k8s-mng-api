"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// 可変階層のパスをハンドリング
// http://dotnsf.blog.jp/archives/1078520620.html
app.use(function (req, res, next) {
    if (req.url.startsWith('/api/svc/serviceInvoke/')) {
        const prfx = '/api/svc/serviceInvoke/';
        let params = req.url.substr(prfx.length);
        //console.log(params)
        // http://34.146.130.74:3010/api/svc/serviceInvoke/istio-taest/customers/api/customers/hello
        res.redirect(`/api/svc/serviceInvoke?params=${params}`);
    }
    else {
        // '/api/svc/serviceInvoke' で始まらないパスへのアクセスだった場合はそのまま処理する
        next();
    }
});
app.listen(port, host, () => console.log('Service Resource API is running on ' + host + ':' + port));
const k8s = require("@kubernetes/client-node");
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAppsV1Api = kc.makeApiClient(k8s.AppsV1Api);
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
app.get('/api/svc/listAllpods/:ns', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const ns = req.params.ns;
        console.log('list all pods');
        const resu = yield k8sCoreApi.listNamespacedPod('default', undefined, undefined, undefined, undefined, 'app=histories');
        console.log(resu.body.items);
        /*
        .then((response) => {
          // tslint:disable-next-line:no-console
          console.log(response.body.items);
          res.json({'msg':'Got a POST request'});
        });
        */
        res.send(resu.body.items);
    });
});
app.get('/api/svc/listAllServices/:ns', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const ns = req.params.ns;
        console.log('list all services');
        const resu = yield k8sCoreApi.listNamespacedService('default');
        console.log(resu.body.items);
        let svcs = resu.body.items.map(svc => {
            return {
                name: svc.metadata.name,
                clusterIP: svc.spec.clusterIP,
                'port(s)': svc.spec.ports.map(port => (`${port.port}/${port.protocol}`))
            };
        });
        console.log(svcs);
        /*
        .then((response) => {
          // tslint:disable-next-line:no-console
          console.log(response.body.items);
          res.json({'msg':'Got a POST request'});
        });
        */
        res.send(svcs);
    });
});
// curl -X POST -H "Content-Type: application/json" -d '{"name":"太郎", "age":"30"}' http://34.146.130.74:3010/api/service/test/service/test
// curl -X POST -F file=@liveness-check.yml http://34.146.130.74:3010/api/svc/serviceDeploymentRunning
// selector is needed!!
app.post('/api/svc/serviceDeploymentRunning', upload.single('file'), function (req, res) {
    console.log('serviceDeploymentRunning');
    console.log('label:app: is needed for service discovery');
    console.log(req.file.filename);
    (0, apply_1.apply)(`uploads/${req.file.filename}`);
    //res.send('Got a POST request')
    // res.jsonメソッドは、ヘッダーにContent-Typeにapplication/jsonを追加、オブジェクトをJSON.stringify()して返してくれます。
    res.json({ 'msg': `saved file @ uploads/${req.file.filename}` });
});
// selector is needed!!
app.post('/api/svc/serviceRegister', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(req.file.filename);
        const resu = yield (0, apply_1.apply)(`uploads/${req.file.filename}`);
        console.log(resu);
        res.json({ 'msg': `saved file @ uploads/${req.file.filename}` });
    });
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
app.get('/api/svc/healthCheck/:ns/:svcname', function (req, res) {
    const ns = req.params.ns;
    const svcname = req.params.svcname;
    console.log('serviceDiscovery purek8sapi');
    //console.log(jp.query(cities, '$.items'))
    const opts = {};
    kc.applyToRequest(opts);
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/${svcname}`, opts, (error, response, body) => {
        var _a, _b;
        if (error) {
            console.log(`error: ${error}`);
        }
        if (response) {
            console.log(`statusCode: ${response.statusCode}`);
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
            let item = JSON.parse(body);
            console.log(item);
            let addresses = (_a = item.subsets) === null || _a === void 0 ? void 0 : _a[0].addresses.map(addr => {
                return addr.ip; //{ip:addr.ip, uid:addr.targetRef.uid}
            });
            let ports = (_b = item.subsets) === null || _b === void 0 ? void 0 : _b[0].ports;
            console.log(addresses);
            //k8sCoreApi.listNamespacedPod('default', undefined, undefined, undefined, undefined, `app=${svcname}`).then((response) => {
            k8sCoreApi.listNamespacedPod(ns).then((response) => {
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
app.get('/api/svc/serviceDiscovery/:ns/:svcname', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const ns = req.params.ns;
        const svcname = req.params.svcname;
        console.log('serviceDiscovery');
        const resu = yield serviceDiscovery(svcname, ns);
        console.log(resu);
        res.send(resu);
    });
});
// Kubernetes scheduling is simply the process of assigning pods to the matched nodes in a cluster.
// https://thenewstack.io/a-deep-dive-into-kubernetes-scheduling/
// If you want to run your pods on a specific set of nodes, use nodeSelector to ensure that happens. You can define the nodeSelector field as a set of key-value pairs in ‘PodSpec’:
// Node Affinity
// 実際的なユースケース
// Pod間アフィニティとアンチアフィニティは、ReplicaSet、StatefulSet、Deploymentなどのより高レベルなコレクションと併せて使用するとさらに有用です。
// https://kubernetes.io/ja/docs/concepts/scheduling-eviction/assign-pod-node/
app.get('/api/svc/serviceScheduleOnNodes/:svcname', function (req, res) {
    const svcname = req.params.svcname;
    console.log('service schedule');
});
// get service's invocation urls
app.get('/api/svc/serviceInvoke', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = req.query.params.split('/');
        console.log(params);
        const ns = params[0];
        const svcname = params[1];
        const path = '/' + params.slice(2).join('/');
        console.log(path);
        console.log('service Invoke');
        // http://34.146.130.74:3010/api/svc/serviceInvoke/customers/api/customers/hello
        const resu = yield serviceInvoke(svcname, ns, path);
        console.log(resu);
        res.send(resu);
    });
});
function serviceDiscovery(svcname, ns) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield k8sCoreApi.readNamespacedEndpoints(svcname, ns);
        console.log(res.body);
        const subsets = res.body.subsets;
        let addresses = subsets === null || subsets === void 0 ? void 0 : subsets[0].addresses.map(addr => {
            return addr.ip; //{ip:addr.ip, uid:addr.targetRef.uid}
        });
        let port = subsets === null || subsets === void 0 ? void 0 : subsets[0].ports[0].port;
        console.log(addresses);
        console.log(port);
        return { ips: addresses, port: port };
    });
}
// https://stackoverflow.com/questions/49938266/how-to-return-values-from-async-functions-using-async-await-from-function
// https://www.i-ryo.com/entry/2020/06/05/192657?amp=1
// http://34.146.130.74:3010/api/svc/serviceInvoke/customers/api/customers/hello
function serviceInvoke(svcname, ns, path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connectTo = yield serviceDiscovery(svcname, ns);
            const res = {
                svc_url: {
                    with_ip: connectTo.ips.map(ip => { return `http://${ip}:${connectTo.port}${path}`; }),
                    with_svcname: `http://${svcname}.${ns}:${connectTo.port}${path}`,
                    with_dapr: `http://127.0.0.1:3500/v1.0/invoke/${svcname}.${ns}/method${path}`,
                    note: 'svc_urls are ONLY accessible from inside the cluster.'
                }
            };
            //console.log(res)
            return res;
        }
        catch (err) {
            return `Error getting invocation url of service: ${svcname}, namespace: ${ns}.`;
        }
        //const res = await fetch(`http://${connectTo.ips[0]}:${connectTo.port}${path}`)
        //const json = await res.json()
        //return json
    });
}
// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#-strong-write-operations-service-v1-core-strong-
app.get('/api/svc/serviceCancel/:ns/:svcname', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const ns = req.params.ns;
        const svcname = req.params.svcname;
        console.log('service cancel');
        console.log('read service info and delete selectored service and corresponding deployments');
        const doit = (svcname, namespace) => __awaiter(this, void 0, void 0, function* () {
            const svcdata = yield k8sCoreApi.readNamespacedService(svcname, namespace);
            console.log(svcdata.body.spec.selector.app);
            const delSvc = yield k8sCoreApi.deleteNamespacedService(svcname, namespace);
            console.log(delSvc);
            const depList = yield k8sAppsV1Api.listNamespacedDeployment(namespace);
            console.log(depList.body.items.filter(dep => dep.spec.selector.matchLabels.app == svcdata.body.spec.selector.app));
            const deps = depList.body.items.filter(dep => dep.spec.selector.matchLabels.app == svcdata.body.spec.selector.app);
            for (let i = 0; i < deps.length; i++) {
                const delDep = yield k8sAppsV1Api.deleteNamespacedDeployment(deps[i].metadata.name, deps[i].metadata.namespace);
                console.log(delDep);
            }
        });
        (() => __awaiter(this, void 0, void 0, function* () {
            console.log(yield doit(svcname, ns));
        }))();
    });
});
//console.log('Hello TypeScript');
let message = 'Service Resource Management API';
console.log(message);
const person_1 = require("./person");
let taro = new person_1.Person('Service Resource API', 1, 'v1.0.0');
console.log(taro.name); // Taro
//console.log(taro.age)  // ageはprivateなのでコンパイルエラー
console.log(taro.profile()); // privateのageを含むメソッドなのでエラーになる
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
