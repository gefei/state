/* global describe, it */
var assert = require("assert"),
	state = require("../lib/node");

var model = new state.State("model");
var region = new state.Region("region", model);
var initial = new state.PseudoState("initial", region, state.PseudoStateKind.Initial);
var ortho = new state.State("ortho", region);
var simple = new state.State("simple", region);
var final = new state.State("final", region);

var r1 = new state.Region("r1", ortho);
var r2 = new state.Region("r2", ortho);

var i1 = new state.PseudoState("initial", r1, state.PseudoStateKind.ShallowHistory);
var i2 = new state.PseudoState("initial", r2, state.PseudoStateKind.ShallowHistory);

var s1 = new state.State("s1", r1);
var s2 = new state.State("s2", r2);

var f1 = new state.State("f1", r1);
var f2 = new state.State("f2", r2);

initial.to(ortho);

i1.to(s1);
i2.to(s2);

ortho.to(final); // This should happen once all regions in ortho are complete?

s1.to(f1).when(trigger => trigger === "complete1");
s2.to(f2).when(trigger => trigger === "complete2");
ortho.to(simple).when(trigger => trigger === "jump");
simple.to(ortho).when(trigger => trigger === "back");

var instance = new state.Instance("muximise", model);

describe("test/muximise.js", function () {
	describe("State type tests", function () {
		// ensure only simple states return true for isSimple
		it("simple state isSimple", function () {
			assert(simple.isSimple());
			assert(!ortho.isSimple());
		});

		// ensure only composite states return true for isComposite
		it("State.isComposite", function () {
			assert(!simple.isComposite());
			assert(ortho.isComposite());
		});

		// ensure only orthogonal states return true for isOrthogonal
		it("State.isOrthogonal", function () {
			assert(!simple.isOrthogonal());
			assert(ortho.isOrthogonal());
		});
	});

	describe("Orthogonal state completion", function () {
		// ensure that completion transitions for orthogonal states are triggered after completion of all child regions
		it("Completion transition fires once all regions of an orthogonal state are complete", function () {
			instance.evaluate("complete1");
			instance.evaluate("complete2");

			assert.equal(final, instance.get(region));
		});
	});
});
