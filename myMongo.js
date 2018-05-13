const mongoose = require('mongoose');

const streamObj = {
    '@context': {
        name: String,
        creador: String,
        track: String,
        uri: String,
        _dt: String
    }
};

const Stream = mongoose.model('Stream', streamObj);
let promises = mongoose.connect('mongodb://patata:patata@ds117010.mlab.com:17010/mydb');

class myMongoDB {

    constructor(dataDir) {

    }

    saveLdGraph(stream) {
        let str = new Stream(stream);
        str.save();
    }

    getLdGraph(callback) {
        Stream.find((err, streams) => {
            if (err) return console.error(err);
            callback(streams);
        })
    }

}//END CLASS

exports.myMongoDB = myMongoDB;