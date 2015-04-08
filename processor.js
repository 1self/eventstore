'use strict';

var winston = require('winston'); 

var logger = winston;
var setLogger = function(anotherLogger){
	anotherLogger.info('processor logger updated', anotherLogger);
	logger = anotherLogger;
}; // this can be called outside the module to set the logger

console.log(winston.transports.Console.toString());

winston.debug('Debug messages will be logged in processor');

var process = function(channel, event, eventRepository){
	// eas: we need to do this to copy what the event platform does - there is a custom $date
	// formatter in the event platform that converts the dates
	event.eventDateTime = new Date(event.eventDateTime.$date);
	event.eventLocalDateTime = new Date(event.eventLocalDateTime.$date);

	winston.debug("message recieved from channel " + channel);
	var dbEvent = {};
	dbEvent.event = {};
	dbEvent.event.createdOn = new Date();
	dbEvent.event.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
	dbEvent.payload = event;
	eventRepository.add(dbEvent);
};

module.exports = {};
module.exports.process = process;
module.exports.setLogger = setLogger;