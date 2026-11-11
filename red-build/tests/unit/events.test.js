// tests/unit/events.test.js — explicit trace capture state (REQ-GOV-01)
'use strict';

const { describe, it, assert, assertEq, report } = require('../harness');
const { EventLog } = require('../../src/engine/core/events');

describe('EventLog trace-v2 capture contract', () => {
  it('off: records no events and explicitly marks the stream as disabled/incomplete', () => {
    const log = new EventLog('off');
    log.emit('parse', 'parsed', { tokens: 3 }, 2);
    const trace = log.toTraceV2();

    assertEq(trace.schema, 'trace-v2');
    assertEq(trace.events.length, 0);
    assertEq(trace.capture.recording, false);
    assertEq(trace.capture.verbosity, 'off');
    assertEq(trace.capture.eventStreamComplete, false);
    assert(trace.capture.omittedFields.includes('events'));
    assertEq(trace.droppedEvents, 0);
  });

  it('standard: event stream is complete at selected detail level and pageIndex omission is explicit', () => {
    const log = new EventLog('standard');
    log.emit('parse', 'parsed', { tokens: 3 }, 2);
    const trace = log.toTraceV2();

    assertEq(trace.events.length, 1);
    assertEq(trace.events[0].payload, { tokens: 3 });
    assertEq(trace.events[0].pageIndex, null);
    assertEq(trace.capture.recording, true);
    assertEq(trace.capture.verbosity, 'standard');
    assertEq(trace.capture.eventStreamComplete, true);
    assert(trace.capture.omittedFields.includes('pageIndex'));
    assert(!trace.capture.omittedFields.includes('payload'));
  });

  it('minimal: payload and pageIndex omissions are both declared', () => {
    const log = new EventLog('minimal');
    log.emit('parse', 'parsed', { tokens: 3 }, 2);
    const trace = log.toTraceV2();

    assertEq(trace.events[0].payload, {});
    assertEq(trace.events[0].pageIndex, null);
    assertEq(trace.capture.omittedFields, ['payload', 'pageIndex']);
  });

  it('full: no intentional fields are omitted', () => {
    const log = new EventLog('full');
    log.emit('parse', 'parsed', { tokens: 3 }, 2);
    const trace = log.toTraceV2();

    assertEq(trace.events[0].pageIndex, 2);
    assertEq(trace.capture.omittedFields, []);
    assertEq(trace.capture.eventStreamComplete, true);
  });

  it('unknown stage is counted and makes an enabled stream incomplete', () => {
    const log = new EventLog('full');
    log.emit('not-a-stage', 'bad-stage', { ignored: true }, 0);
    const trace = log.toTraceV2();

    assertEq(trace.events.length, 0);
    assertEq(trace.droppedEvents, 1);
    assertEq(trace.capture.droppedEvents, 1);
    assertEq(trace.capture.eventStreamComplete, false);
  });
});

report('events');
