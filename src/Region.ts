import { log, PseudoStateKind, State, PseudoState, Visitor } from '.';
import { Transaction } from './Transaction';

/**
 * A region is a container of vertices (states and pseudo states) within a state machine model.
 */
export class Region {
	/**
	 * The child  vertices of this region.
	 * @internal
	 * @hidden
	 */
	vertices: Array<State | PseudoState> = [];

	/**
	 * The initial pseudo state, defining the starting vertex when region is entered.
	 * @internal
	 * @hidden
	 */
	initial: PseudoState | undefined;

	/**
	 * Creates a new instance of the Region class.
	 * @param name The name of the region.
	 * @param parent The parent state of this region.
	 */
	public constructor(public readonly name: string, public readonly parent: State) {
		log.write(() => `Created ${this}`, log.Create);

		parent.regions.push(this);
	}

	/** 
	 * Tests a state machine instance to see if this region is complete within it.
	 * A region is complete if it's current state is a final state (one with no outgoing transitions).
	 * @internal
	 * @hidden 
	 */
	isComplete(transaction: Transaction): boolean {
		const currentState = transaction.get(this);

		return currentState !== undefined && currentState.isFinal();
	}

	/**
	 * Performs the initial steps required to enter an element during a state transition.
	 * @param transaction The current transaction being executed.
	 * @param history Flag used to denote deep history semantics are in force at the time of entry.
	 * @param trigger The event that triggered the state transition.
	 * @internal
	 * @hidden
	 */
	doEnterHead(transaction: Transaction): void {
		log.write(() => `${transaction.instance} enter ${this}`, log.Entry);
	}

	/**
	 * Performs the final steps required to enter the region dueing state transition; enters the region using the initial pseudo state or history logic.
	 * @param transaction The current transaction being executed.
	 * @param deepHistory Flag used to denote deep history semantics are in force at the time of entry.
	 * @param trigger The event that triggered the state transition.
	 * @internal
	 * @hidden
	 */
	doEnterTail(transaction: Transaction, deepHistory: boolean, trigger: any): void {
		const current = transaction.get(this);
		const starting = current && this.history(deepHistory, PseudoStateKind.History) ? current : this.initial;

		if (starting) {
			starting.doEnter(transaction, this.history(deepHistory, PseudoStateKind.DeepHistory), trigger);
		} else {
			throw new Error(`Unable to find starting state in region ${this}`);
		}
	}

	/**
	 * Determines if the region has a particular history semantic.
	 * @hidden 
	 */
	history(deepHistory: boolean, kind: PseudoStateKind): boolean {
		return deepHistory || (this.initial !== undefined && !!(this.initial.kind & kind));
	}

	/**
	 * Exits a region during a state transition.
	 * @param transaction The current transaction being executed.
	 * @param deepHistory Flag used to denote deep history semantics are in force at the time of exit.
	 * @param trigger The event that triggered the state transition.
	 * @internal
	 * @hidden
	 */
	doExit(transaction: Transaction, deepHistory: boolean, trigger: any): void {
		const vertex = transaction.getVertex(this);

		if (vertex) {
			vertex.doExit(transaction, deepHistory, trigger);
		}

		log.write(() => `${transaction.instance} leave ${this}`, log.Exit);
	}

	/**
	 * Accepts a visitor and calls back its visitRegion method and cascade to child vertices.
	 * @param visitor The visitor to call back.
	 */
	public accept(visitor: Visitor): void {
		visitor.visitRegion(this);

		this.vertices.forEach(vertex => vertex.accept(visitor));

		visitor.visitRegionTail(this);
	}

	/**
	 * Returns the element in string form; the fully qualified name of the element.
	 */
	public toString(): string {
		return `${this.parent}.${this.name}`;
	}
}
