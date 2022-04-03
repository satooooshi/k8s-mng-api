"use strict";
exports.__esModule = true;
exports.ServiceResourceApi = void 0;
var k8s = require("@kubernetes/client-node");
var kc = new k8s.KubeConfig();
kc.loadFromDefault();
var k8sApi = kc.makeApiClient(k8s.CoreV1Api);
var request = require("request");
var ServiceResourceApi = /** @class */ (function () {
    function ServiceResourceApi(basePath) {
        this.basePath = basePath;
        console.log("basePath is set to ".concat(this.basePath));
    }
    ServiceResourceApi.prototype.serviceDeploymentRunning = function (serviceName, configFileName) {
        console.log('serviceDeploymentRunning');
        request.get('http://httpbin.org/get', function (err, res, body) {
            if (err) {
                console.log('Error: ' + err.message);
                return;
            }
            console.log(body);
        });
    };
    ServiceResourceApi.prototype.serviceRegister = function (serviceID, ip, port) {
        console.log('serviceRegister');
        k8sApi.listNamespacedPod('default')
            .then(function (res) {
            // tslint:disable-next-line:no-console
            console.log(JSON.stringify(res.body, null, 2));
        });
    };
    ServiceResourceApi.prototype.example = function () {
        console.log('example');
        var opts = {};
        kc.applyToRequest(opts);
        request.get("".concat(kc.getCurrentCluster().server, "/api/v1/namespaces/default/pods"), opts, function (error, response, body) {
            if (error) {
                console.log("error: ".concat(error));
            }
            if (response) {
                console.log("statusCode: ".concat(response.statusCode));
            }
            console.log("body: ".concat(body));
        });
    };
    return ServiceResourceApi;
}());
exports.ServiceResourceApi = ServiceResourceApi;
