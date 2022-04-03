const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const host = '0.0.0.0'
const port = 3010


const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();

app.use(cors());

// urlencodedとjsonは別々に初期化する
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/api/hello', function (req, res) {

  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  k8sApi.listNamespacedPod('default').then((response) => {
    // console.log(JSON.stringify(response.body.items));
    // console.log(res.body.toSource());
    return res.send(JSON.stringify(response.body.items, null, 4))
  });

//		return res.send("no data responded")
})

app.listen(port, host, () => console.log('API is running on '+host+':'+port));

