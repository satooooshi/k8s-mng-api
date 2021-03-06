import k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

import request = require('request');
import fetch from 'node-fetch';

import jp = require('jsonpath');


// https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#-strong-service-apis-strong-

export enum HealthStatus {
  'OK',
}

export class ServiceResourceApi {

  constructor(
    private basePath?: string
  ){}

  // deployment 
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


  // service
  // POST /api/v1/namespaces/{namespace}/services
  public serviceRegister(serviceID?: string, ip?: number, port?: number){
    console.log('serviceRegister')
    k8sApi.listNamespacedPod('default')
    .then((res) => {
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(res.body, null, 2))
    });

  }

  // PATCH /api/v1/namespaces/{namespace}/services/{name}
  public serviceReload(serviceID?: string, ip?: number, port?: number){
    console.log('serviceRegister')
    k8sApi.listNamespacedPod('default')
    .then((res) => {
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(res.body, null, 2))
    });

  }



  // GET /api/v1/namespaces/default/services?pretty=true
  public listServices(){
    console.log('listServices')
    var cities = [
      { name: "London", "population": 8615246 },
      { name: "Berlin", "population": 3517424 },
      { name: "Madrid", "population": 3165235 },
      { name: "Rome",   "population": 2870528 }
    ];
    //console.log(jp.query(cities, '$.items'))
    const opts = {} as request.Options;
    kc.applyToRequest(opts);
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
            //console.log(bufone.items)
            let buftwo=bufone.items.map(item=>{
              return {name:item.metadata.name, uid:item.metadata.uid, clusterIP:item.spec.clusterIP, ports:item.spec.ports}
            })
            console.log(JSON.stringify(buftwo, null, 2))
            //console.log(`body: ${JSON.stringify(body, ["items", "metadata", "name"], 2)}`);
            //console.log(JSON.parse(body));
            //console.log(jp.query(JSON.parse(body), '$..clusterIP'));
            //console.log(`body: ${JSON.stringify(body, ["items", "metadata", "name"], 2)}`);
      });

  }

  // kubectl get ep
   public async serviceDiscovery(serviceIdList?: string[]){
    console.log('serviceDiscovery')
    //console.log(jp.query(cities, '$.items'))
    const opts = {} as request.Options;
    kc.applyToRequest(opts);
  
    //request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/histories?pretty=true`, opts,
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/histories`, opts,
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
            //console.log(jp.query(JSON.parse(body), '$.kind'))
            let addresses=item.subsets[0].addresses.map(addr=>{
              return {ip:addr.ip, uid:addr.targetRef.uid}
            })
            let ports=item.subsets[0].ports
            console.log(JSON.stringify(addresses, null, 2))
            console.log(JSON.stringify(ports, null, 2))

            //return 'heya'
      });
  }


  // kubectl get ep
  public async serviceDiscoveryTest(serviceIdList?: string[]){
    console.log('serviceDiscovery')
    //console.log(jp.query(cities, '$.items'))
    const opts = {} as request.Options;
    kc.applyToRequest(opts);
  
    //request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/services/histories?pretty=true`, opts,
    request.get(`${kc.getCurrentCluster().server}/api/v1/namespaces/default/endpoints/histories`, opts,
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
            //console.log(JSON.stringify(addresses, null, 2))
            //console.log(JSON.stringify(ports, null, 2))
            console.log(jp.query(JSON.parse(body),'$.subsets[*].addresses[*].ip'))
            console.log(jp.query(JSON.parse(body),'$.subsets[*].ports[*].port'))
            //return 'heya'
      });
  }

  // https://cstoku.dev/posts/2018/k8sdojo-10/
  // kubectl describe po/liveness-check
  // kubectl exec liveness-check -- rm /usr/share/nginx/html/index.html

  // LivenessProbe?????????????????????????????????Kill???????????????????????????????????????????????????

  //ReadinessProbe???Unhealthy???????????????????????????Service??????????????????????????????????????????
  // ??????Healthy????????????????????????????????????????????????????????????Service???????????????????????????????????????????????????????????????????????????
  //
  // Liveness Probe???Readiness Probe???????????????
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
  public healthCheck(serviceIdList?: string[]){ 
    console.log('healthCheck')
    const opts = {} as request.Options;
    kc.applyToRequest(opts);

    request.get(`http://10.42.0.14:3005/api/histories/hello`, opts,
    (error, response, body) => {
        if (error) {
            console.log(`error: ${error}`);
        }
        if (response) {
            console.log(`statusCode: ${response.statusCode}`);
        }
        console.log(`body: ${JSON.stringify(body, null, 2)}`);
    });

  }

  public serviceStatusManage(serviceIdList?: string[]){
    console.log('serviceStatusManage')

  }

  public serviceSchedule(serviceId?: string){
    console.log('serviceSchedule')
    // kubectl get pods -o wide
    // healthchekc pod
    //kubectl exec po/busybox-sleep -- wget -O index.html 10.42.0.23:80
    // reactfront
    //kubectl exec po/busybox-sleep -- wget -O index.html 10.42.0.12:3000

    // curl pod
    // kubectl run -it --rm=true busybox --image=yauritux/busybox-curl --restart=Never

  }

  // DELETE /api/v1/namespaces/{namespace}/services/{name}
  public serviceCancel(serviceId?: string){
    console.log('serviceCancel')


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
            console.log(`body: ${JSON.stringify(body, null, 2)}`);
      });

  }

}