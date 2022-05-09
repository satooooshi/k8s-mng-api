npm i  
npm start  

compile ts files 
npx tsc --init
--> tscofig.json is generated

how to run
npx tsc && node app.js

when compilling a single ts file
npx tsc app.ts  
--> app.js is generated  

typescript compile
  // "strict": true,  


知識ゼロから始めるTypeScript 〜クラス編〜
https://qiita.com/yukiji/items/3db06601ece7f080b0d0

TypeScriptでモジュールを作成する／インポートする (export, import)
https://maku.blog/p/fbu8k8j/


api class imple.
https://github.com/kubernetes-client/javascript/blob/master/src/gen/api/discoveryV1Api.ts


【TypeScript】クラス定義
https://qiita.com/t_t238/items/e7e611c354e030a5a61a


Forbiddenメッセージが表示されました。--addressで指定する場合は--accept-hostsでそのアドレスを指定する必要があります。
https://techstep.hatenablog.com/entry/2019/01/27/220044

list all api
curl http://127.0.0.1:8001/ | jq .

kubectl proxy --address 0.0.0.0 --accept-hosts '.*'

「匿名リクエスト」機能
https://kakakakakku.hatenablog.com/entry/2021/07/13/084136
TOKEN=$(kubectl get secrets -o jsonpath="{.items[?(@.metadata.annotations['kubernetes\.io/service-account\.name']=='default')].data.token}" | base64 --decode)
curl -s -k https://172.17.0.12:8443/api --header "Authorization: Bearer ${TOKEN}"




curl -s -k https://34.146.130.74:8443/api --header "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImVTeVZURUl3dmw5U2VmWGJjRkZKWVBORmgwWnpLR0YyRUljVkJsRGZ1eFEifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tczQ0d2siLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjVjZjQ5ZjgxLWRiNzktNGQ1ZC04ZmE0LWNlOTk4YzI2ZWUzNSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.NMT1FCvBMRCvNMd_RweZlyzZi55NG1B2_Eh2CvCIxfFoR5hjbvAoep644qs9jinstF0rn5nwehX6hyOfE1jqW9Kc357L7-ATyE-xzhv4Sx6dHqmbHeZ-wH0mE4NoGsycU2fZxtIsK2MrHjY0-b6XzIcc7uY15BSsDCpP0zfaiEFJ8g4PdPZ8MvQ3VlW7MqdvRLgSniD6r-zvUFUFLXNCDRXAsFv_xEJB6I-gyCuBWfVltFQNoLQaibHzJpbh0aboCiJTTDY0Xw0StU5aW0llAB-5bKQTN1KpiXg5jTJ5ZAxlQihOxOhkr3bdN8cQGIvg9YGjmubXyjgS2rhty47OLQ"



curl -s -k http://34.146.130.74:8001/api --header "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImVTeVZURUl3dmw5U2VmWGJjRkZKWVBORmgwWnpLR0YyRUljVkJsRGZ1eFEifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tczQ0d2siLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjVjZjQ5ZjgxLWRiNzktNGQ1ZC04ZmE0LWNlOTk4YzI2ZWUzNSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.NMT1FCvBMRCvNMd_RweZlyzZi55NG1B2_Eh2CvCIxfFoR5hjbvAoep644qs9jinstF0rn5nwehX6hyOfE1jqW9Kc357L7-ATyE-xzhv4Sx6dHqmbHeZ-wH0mE4NoGsycU2fZxtIsK2MrHjY0-b6XzIcc7uY15BSsDCpP0zfaiEFJ8g4PdPZ8MvQ3VlW7MqdvRLgSniD6r-zvUFUFLXNCDRXAsFv_xEJB6I-gyCuBWfVltFQNoLQaibHzJpbh0aboCiJTTDY0Xw0StU5aW0llAB-5bKQTN1KpiXg5jTJ5ZAxlQihOxOhkr3bdN8cQGIvg9YGjmubXyjgS2rhty47OLQ"


jsonpath
https://www.npmjs.com/package/jsonpath
https://kubernetes.io/ja/docs/reference/kubectl/jsonpath/
https://qiita.com/takkii1010/items/0ce1c834d3a73496ccef

kubectl get service -o json -o=jsonpath="{range .items[*]}{.metadata.name}{'\t'}{.status.startTime}{'\n'}{end}"
kubectl get pods -o=jsonpath="{range .items[*]}{.metadata.name}{\"\t\"}{.status.startTime}{\"\n\"}{end}"


swagger how to write
http://honeplus.blog50.fc2.com/blog-entry-164.html
