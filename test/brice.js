/* global describe, it */
var assert = require("assert"),
	state = require("../lib/node");

var model = new state.State("model");
var initial1 = new state.PseudoState("initial", model, state.PseudoStateKind.Initial);
var myComposite1 = new state.State("composite1", model);
var region1 = new state.Region("region1", myComposite1);
var state3 = new state.State("state3", model);
var initial2 = new state.PseudoState("initial", region1, state.PseudoStateKind.Initial);
var state1 = new state.State("state1", region1);
var state2 = new state.State("state2", region1);

initial1.to(myComposite1);
initial2.to(state1);
myComposite1.on(String).when(trigger => trigger === "a").to(state3);
state1.on(String).when(trigger => trigger === "a").to(state2);

var instance = new state.Instance("brice", model);

describe("test/brice.js", function () {
	it("Transitions should be selected depth-first", function () {
		instance.evaluate("a");

		assert.equal(state2, instance.get(region1));
	});
});