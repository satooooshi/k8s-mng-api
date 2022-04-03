"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceResourceApi = exports.HealthStatus = void 0;
const k8s = require("@kubernetes/client-node");
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const request = require("request");
const jp = require("jsonpath");
var HealthStatus;
(function (HealthStatus) {
    HealthStatus[HealthStatus["OK"] = 0] = "OK";
})(HealthStatus = exports.HealthStatus || (exports.HealthStatus = {}));
class ServiceResourceApi {
    constructor(basePath) {
        this.basePath = basePath;
        console.log(`basePath is set to ${this.basePath}`);
    }
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
    serviceRegister(serviceID, ip, port) {
        console.log('serviceRegister');
        k8sApi.listNamespacedPod('default')
            .then((res) => {
            // tslint:disable-next-line:no-console
            console.log(JSON.stringify(res.body, null, 2));
        });
    }
    serviceDiscovery(serviceIdList) {
        console.log('serviceDiscovery');
        var cities = [
            { name: "London", "population": 8615246 },
            { name: "Berlin", "population": 3517424 },
            { name: "Madrid", "population": 3165235 },
            { name: "Rome", "population": 2870528 }
        ];
        //console.log(jp.query(cities, '$.items'))
        const opts = {};
        kc.applyToRequest(opts);
        request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services`, opts, (error, response, body) => {
            if (error) {
                console.log(`error: ${error}`);
            }
            if (response) {
                console.log(`statusCode: ${response.statusCode}`);
            }
            console.log(jp.query(JSON.parse(body), '$.items'));
            //console.log(`body: ${JSON.stringify(body, ["items", "metadata", "name"], 2)}`);
        });
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
