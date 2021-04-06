// this test creates the following state machine model structure:
//
// model
// + default
//   + initial      completion transition to stateA
//   + stateA       transition "move" to stateB and therefore bStateI
//   + stateB       two transtions "local" and "exter" to bStateII
//     + default
//       + bInitial completion transition to bStateI
//       + bStateI
//       + bSTateII

/* global describe, it */
var assert = require("assert"),
	state = require("../lib/node");

// create the state machine model elements
var model = new state.State("model");
var initial = new state.PseudoState("initial", model, state.PseudoStateKind.Initial);
var stateA = new state.State("stateA", model);
var stateB = new state.State("stateB", model);//.exit(function (instance) { instance.stateBExitCount++; });
var regionB = new state.Region("regiobB", stateB);

var bInitial = new state.PseudoState("bInitial", regionB);
var bStateI = new state.State("bStateI", regionB);
var bStateII = new state.State("bStateII", regionB);

// create the state machine model transitions
initial.to(stateA);
stateA.to(stateB).when(trigger => trigger === "move");

bInitial.to(bStateI);

var local = stateB.to(bStateII, state.TransitionKind.Local).when(trigger => trigger === "local");
var exter = stateB.to(bStateII).when(trigger => trigger === "to");

// create a state machine instance
var instance = new state.Instance("instance", model);

// send the machine instance a message for evaluation, this will trigger the transition from stateA to stateB
instance.evaluate("move");
instance.evaluate("local");
instance.evaluate("to");

describe("Local transition tests", function () {
	it("External transition fired OK", function () {
		assert.equal(bStateII, instance.get(regionB));
	});
});
