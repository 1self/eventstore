'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//var config = require('./config');
var redis = require('redis');
var MongoClient = require('mongodb').MongoClient;
var winston = require('winston');
var processor = require('./processor');

winston.add(winston.transports.File, { filename: 'events.log', level: 'debug', json: false });

winston.error("Errors will be logged here");
winston.warn("Warns will be logged here");
winston.info("Info will be logged here");
winston.debug("Debug will be logged here");

var redisClient = redis.createClient();
redisClient.subscribe('eventstore');


var q = require('q');

var mongoClient = require('mongodb').MongoClient;
console.log("mongo uri is: " + process.env.EVENTDBURI);

var eventRepository = {};
eventRepository.eventDbUri = process.env.EVENTDBURI;

eventRepository.eventDbConnection = function(callback) {
    //if already we have a connection, don't connect to database again
    if (eventRepository.eventDbInstance) {
        callback(eventRepository.eventDbInstance);
        return;
    }

    winston.debug(eventRepository.eventDbUri);
    mongoClient.connect(eventRepository.eventDbUri, function(err, databaseConnection) {
        winston.info("mongoc: " + err + " " + databaseConnection);
        if (err) {
            console.log(err);
        } else {
            eventRepository.eventDbInstance = databaseConnection;
            callback(databaseConnection);
        }
    });

};

eventRepository.insert = function (collection, document) {
	winston.debug('collection is ' + collection);
	//winston.debug(document);
    var deferred = q.defer();
    eventRepository.eventDbConnection(function (eventDb) {
        eventDb.collection(collection).insert(document, function (err, insertedRecords) {
        	winston.debug('database returned error', err);
        	winston.debug('database returned record', insertedRecords);
            if (err) {
                winston.error(err);
                deferred.reject(err);
            } else {
                deferred.resolve(insertedRecords[0]);
            }
        });
    });
    return deferred.promise;
};

// Connection URL
var url = 'mongodb://localhost:27017/oneself';
// Use connect method to connect to the Server


eventRepository.add = function(event){
	winston.debug('adding event ' + JSON.stringify(event));
	eventRepository.insert('oneself', event);
};

MongoClient.connect(url, function(err) {

	console.log('connected to db');
	if(err){
		console.log(err);
	}

	redisClient.on('message', function(channel, message){
		processor.process(channel, message, eventRepository);
	});
});

module.exports = {};
