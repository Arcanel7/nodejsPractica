const db = require('./myStorage'),
mongoDb = require('./myMongo'),
ms = require('./myStream');
let streamManager = new ms.StreamManager();

class TweetController {

    constructor(){
        this.DB = new db.myDB('./data');
        this.mongo = new mongoDb.myMongoDB();
        this.warmup = this.DB.events;
    }
    listStreamNamesOrderedByLength (callback) {
        this.DB.listStreamNamesOrderedByLength(callback);
    };
    createStream (name, track) {
        const graph = this.addJsonLdContextStream();
        this.mongo.saveLdGraph(graph);
        streamManager.createStream(name, track, graph);
    };
    listIdTweetByStreamName (name, limit, callback) {
        this.DB.getLastObjects(name, limit, (response) => {
            let list = [];
            for (let obj of response.result) {
                list.push(obj.id_str)
            }
            response.result = list
            callback(response);
        });
    };


    listTopWordsOfStream (name, top, callback) {
        this.DB.getLastObjects(name, 50, (response) => {
            let list = [];
            let map = {};
            if (!response.result){
                callback(response)
            }
            for (let obj of response.result) {
                let text = obj.text.split(' ');
                for (let word of text) {
                    if(map[word]) {
                        map[word] = map[word] +1;
                    } else {
                        map[word] = 1;
                    }
                }
            }
            for (let obj in map){
                list.push([obj, map[obj]]);
            }
            list.sort( (elem1, elem2) => {
                return elem2[1] - elem1[1]
            });
            response.result = list.splice(0, top);
            callback(response);
        });
    };

    getPolarityResultsOfStream (name, callback) {

        this.DB.getLastObjects(name, 100, (response) => {
            let polarities = {
                positive: 0,
                negative: 0,
                neutral: 0
            };
            for (let obj of response.result) {
                if(obj.polarity>0){
                    polarities.positive += 1;
                }else if(obj.polarity<0){
                    polarities.negative += 1;
                }else{
                    polarities.neutral += 1;
                }
            }
            response.result = polarities;
            callback(response);
        });
    };
    getGeoTweetOfStream (name, callback){
        this.DB.getLastObjects(name, 0, (response) => {
            let resultado = {};
            for (let obj of response.result) {
                console.log(obj);
                if(obj.coordinates != null){
                    latitude = obj.latitude;
                    longitude = obj.longitude;
                    resultado[obj.id_str] = [latitude,longitude];
                }
            }

            response.result = resultado;
            callback(response);
        });
    };

    addJsonLdContextStream() {
        return {
            "@context": {
                "name": "http://schema.org/name",
                "track": "http://schema.org/query",
                "_dt": "http://schema.org/startTime",
                "uri": "http://schema.org/url",
                "creador": "http://schema.org/agent"
            }
        };
    }

    getLdGraph(callback) {
        this.mongo.getLdGraph( (result) => {
            callback(result);
        });
    }
}

exports.TweetController = TweetController;
