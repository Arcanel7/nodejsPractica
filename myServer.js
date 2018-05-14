const application_root=__dirname,
    express = require("express"),
    path = require("path"),
    bodyparser=require("body-parser"),
    tc = require('./controllers');
let ctrl = new tc.TweetController();

var app = express();
app.use(express.static(path.join(application_root,"public")));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//Cross-domain headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/',(req, res) => {
    res.sendFile('./public/index.html');
});

app.get('/public/:name',(req, res) => {
    let name = req.params.name;
    res.sendFile('./data/' + name + '.data');
});

app.get('/streams',(req, res) => {
    ctrl.listStreamNamesOrderedByLength( (response) => {
        res.send(response);
    });
});

app.post('/stream', (req, res) => {
    let name = req.body.name;
    let track = req.body.track;
    res.send(ctrl.createStream(name, track));
});

app.get('/stream/graph', (req, res) => {
    ctrl.getLdGraph( (result) => {
        res.send(result)
    });
});

//http://localhost:8080/stream/jose/francisco?limit=2&paco=4&pepe=6
app.get('/stream/:name', (req, res) => {
    //Params cuando es :algo
    //query cuando se usa ?limit=2
    //body cuando viene de una petición post
    let name = req.params.name;
    let limit = req.query.limit;
    console.log(name, limit);
//              jose pepe 2 4 6
    ctrl.listIdTweetByStreamName(name, limit, (response) => {
        res.send(response);
    });
});
// de los últimos 50
app.get('/stream/:name/words', (req, res) => {
    let name = req.params.name;
    let top = req.query.top;
    ctrl.listTopWordsOfStream(name, top, (response) => {
        res.send(response);
    });
});

//de los últimos 100
app.get('/stream/:name/polarity', (req, res) => {
    let name = req.params.name;
    ctrl.getPolarityResultsOfStream(name, (response) => {
        res.send(response)
    });
});
/*
 {
 obj1: [X1,Y1],
 obj2: [X2,Y2]
 }
 */
app.get('/stream/:name/geo', (req, res) => {
    let name = req.params.name;
    ctrl.getGeoTweetOfStream(name, (result) => {
        res.send(result)
    });
});

ctrl.warmup.once("warmup", _ => {
   console.log("Web server running on port 8080");
   app.listen(8080, ( )=> {
       console.log("the server is running")
   });
});
