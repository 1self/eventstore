'use strict';
var assert = require('assert');
var processor = require('../processor');

describe('eventstore node module', function () {
  it('must have at least one test', function () {
  	var event = { property: "property"};
  	var writtenEvent;

  	var eventRepository = {};
  	eventRepository.add = function(dbEvent){
  		writtenEvent = dbEvent;
  	};

    processor.process('eventstore', event, eventRepository);
    assert(writtenEvent !== undefined, 'event wasnt written to database');
    assert(writtenEvent.event.id !== undefined, 'event id wasnt set');
    assert(writtenEvent.event.createdOn !== undefined, 'createdOn wasnt set');
    assert(writtenEvent.payload.property !== 'undefined');
  });
});
