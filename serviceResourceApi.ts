import k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

import request = require('request');



export class ServiceResourceApi {

  constructor(protected basePath: string) {
    console.log(`basePath is set to ${this.basePath}`)
  }


  public serviceDeploymentRunning(serviceName?: string, configFileName?: string){
      console.log('serviceDeploymentRunning')
      request.get('http://httpbin.org/get', function(err, res, body) {
  if (err) {
    console.log('Error: ' + err.message);
    return;
  }
  console.log(body);
});
  }

  public serviceRegister(serviceID: string, ip: number, port: number){
    console.log('serviceRegister')
    k8sApi.listNamespacedPod('default')
    .then((res) => {
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(res.body, null, 2))
    });

  }

  public example(){
    console.log('example')
    const opts = {} as request.Options;
    kc.applyToRequest(opts);
    
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/pods`, opts,
        (error, response, body) => {
            if (error) {
                console.log(`error: ${error}`);
            }
            if (response) {
                console.log(`statusCode: ${response.statusCode}`);
            }
            console.log(`body: ${body}`);
      });

  }

}