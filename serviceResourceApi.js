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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceResourceApi = exports.HealthStatus = void 0;
const k8s = require("@kubernetes/client-node");
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const request = require("request");
const jp = require("jsonpath");
// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#-strong-service-apis-strong-
var HealthStatus;
(function (HealthStatus) {
    HealthStatus[HealthStatus["OK"] = 0] = "OK";
})(HealthStatus = exports.HealthStatus || (exports.HealthStatus = {}));
class ServiceResourceApi {
    constructor(basePath) {
        this.basePath = basePath;
    }
    // deployment 
    serviceDeploymentRunning(serviceName, configFileName) {
        console.log('serviceDeploymentRunning');
        request.get('http://httpbin.org/get', function (err, res, body) {
            if (err) {
                console.log('Error: ' + err.message);
                return;
            }
            console.log(body);
        });
    }
    // service
    // POST /api/v1/namespaces/{namespace}/services
    serviceRegister(serviceID, ip, port) {
        console.log('serviceRegister');
        k8sApi.listNamespacedPod('default')
            .then((res) => {
            // tslint:disable-next-line:no-console
            console.log(JSON.stringify(res.body, null, 2));
        });
    }
    // PATCH /api/v1/namespaces/{namespace}/services/{name}
    serviceReload(serviceID, ip, port) {
        console.log('serviceRegister');
        k8sApi.listNamespacedPod('default')
            .then((res) => {
            // tslint:disable-next-line:no-console
            console.log(JSON.stringify(res.body, null, 2));
        });
    }
    // GET /api/v1/namespaces/default/services?pretty=true
    listServices() {
        console.log('listServices');
        var cities = [
            { name: "London", "population": 8615246 },
            { name: "Berlin", "population": 3517424 },
            { name: "Madrid", "population": 3165235 },
            { name: "Rome", "population": 2870528 }
        ];
        //console.log(jp.query(cities, '$.items'))
        const opts = {};
        kc.applyToRequest(opts);
        request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services?pretty=true`, opts, (error, response, body) => {
            if (error) {
                console.log(`error: ${error}`);
            }
            if (response) {
                console.log(`statusCode: ${response.statusCode}`);
            }
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
            let bufone = JSON.parse(body);
            //console.log(bufone.items)
            let buftwo = bufone.items.map(item => {
                return { name: item.metadata.name, uid: item.metadata.uid, clusterIP: item.spec.clusterIP, ports: item.spec.ports };
            });
            console.log(JSON.stringify(buftwo, null, 2));
            //console.log(`body: ${JSON.stringify(body, ["items", "metadata", "name"], 2)}`);
            //console.log(JSON.parse(body));
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'));
            //console.log(`body: ${JSON.stringify(body, ["items", "metadata", "name"], 2)}`);
        });
    }
    // kubectl get ep
    serviceDiscovery(serviceIdList) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('serviceDiscovery');
            //console.log(jp.query(cities, '$.items'))
            const opts = {};
            kc.applyToRequest(opts);
            //request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/histories?pretty=true`, opts,
            request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/histories`, opts, (error, response, body) => {
                if (error) {
                    console.log(`error: ${error}`);
                }
                if (response) {
                    console.log(`statusCode: ${response.statusCode}`);
                }
                //console.log(jp.query(JSON.parse(body), '$..clusterIP'))
                let item = JSON.parse(body);
                //console.log(JSON.stringify(item, null, 2))
                //console.log(jp.query(JSON.parse(body), '$.kind'))
                let addresses = item.subsets[0].addresses.map(addr => {
                    return { ip: addr.ip, uid: addr.targetRef.uid };
                });
                let ports = item.subsets[0].ports;
                console.log(JSON.stringify(addresses, null, 2));
                console.log(JSON.stringify(ports, null, 2));
                //return 'heya'
            });
        });
    }
    // kubectl get ep
    serviceDiscoveryTest(serviceIdList) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('serviceDiscovery');
            //console.log(jp.query(cities, '$.items'))
            const opts = {};
            kc.applyToRequest(opts);
            //request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/histories?pretty=true`, opts,
            request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/histories`, opts, (error, response, body) => {
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
                //console.log(JSON.stringify(addresses, null, 2))
                //console.log(JSON.stringify(ports, null, 2))
                console.log(jp.query(JSON.parse(body), '$.subsets[*].addresses[*].ip'));
                console.log(jp.query(JSON.parse(body), '$.subsets[*].ports[*].port'));
                //return 'heya'
            });
        });
    }
    // https://cstoku.dev/posts/2018/k8sdojo-10/
    // kubectl describe po/liveness-check
    // kubectl exec liveness-check -- rm /usr/share/nginx/html/index.html
    // LivenessProbeが失敗するとコンテナがKillされ、再度作成されて起動してくる。
    //ReadinessProbeはUnhealthyになったコンテナをServiceのルーティング対象から外す。
    // 再びHealthyになった際は再度ルーティング対象となり、Serviceからのトラフィックがルーティングされるようになる。
    //
    // Liveness ProbeとReadiness Probeの使い分け
    // https://bufferings.hatenablog.com/entry/2018/02/17/181946
    // whether cerrtain service's endpoints is healthy or not
    // kubectl describe svc customers
    /*
    IP:                       10.43.221.250
  IPs:                      10.43.221.250
  Endpoints:                10.42.0.13:3002 --> health check this!!
  
  in service name list
  out each endpoints's(pods's) health
  kubectl describe pod liveness-check
  PodScheduled      True
  
  https://cstoku.dev/posts/2018/k8sdojo-10/
  health
  open 80
  
  add /healthz endpoint to apis
    */
    healthCheck(serviceIdList) {
        console.log('healthCheck');
        const opts = {};
        kc.applyToRequest(opts);
        request.get(`http://10.42.0.14:3005/api/histories/hello`, opts, (error, response, body) => {
            if (error) {
                console.log(`error: ${error}`);
            }
            if (response) {
                console.log(`statusCode: ${response.statusCode}`);
            }
            console.log(`body: ${JSON.stringify(body, null, 2)}`);
        });
    }
    serviceStatusManage(serviceIdList) {
        console.log('serviceStatusManage');
    }
    serviceSchedule(serviceId) {
        console.log('serviceSchedule');
        // kubectl get pods -o wide
        // healthchekc pod
        //kubectl exec po/busybox-sleep -- wget -O index.html 10.42.0.23:80
        // reactfront
        //kubectl exec po/busybox-sleep -- wget -O index.html 10.42.0.12:3000
        // curl pod
        // kubectl run -it --rm=true busybox --image=yauritux/busybox-curl --restart=Never
    }
    // DELETE /api/v1/namespaces/{namespace}/services/{name}
    serviceCancel(serviceId) {
        console.log('serviceCancel');
    }
    example() {
        console.log('example');
        const opts = {};
        kc.applyToRequest(opts);
        request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/pods`, opts, (error, response, body) => {
            if (error) {
                console.log(`error: ${error}`);
            }
            if (response) {
                console.log(`statusCode: ${response.statusCode}`);
            }
            console.log(`body: ${JSON.stringify(body, null, 2)}`);
        });
    }
}
exports.ServiceResourceApi = ServiceResourceApi;
