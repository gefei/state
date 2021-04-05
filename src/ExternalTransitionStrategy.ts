import { NamedElement, Region, Vertex, PseudoState } from '.';
import { Transaction } from './Transaction';
import { TransitionStrategy } from './TransitionStrategy';

/**
 * Logic used to traverse external transitions.
 */
export class ExternalTransitionStrategy implements TransitionStrategy {
	private readonly toExit: NamedElement;
	private readonly toEnter: Array<NamedElement>;

	constructor(source: Vertex, target: Vertex) {
		const sourceAncestors = ancestry(source);
		const targetAncestors = ancestry(target);
		let prevSource = sourceAncestors.next();
		let prevTarget = targetAncestors.next();
		let nextSource = sourceAncestors.next();
		let nextTarget = targetAncestors.next();

		while (prevSource.value === prevTarget.value && !nextSource.done && !nextTarget.done) {
			prevSource = nextSource;
			prevTarget = nextTarget;

			nextSource = sourceAncestors.next();
			nextTarget = targetAncestors.next();
		}

		this.toExit = prevSource.value;
		this.toEnter = [prevTarget.value];

		while (!nextTarget.done) {
			this.toEnter.push(nextTarget.value);

			nextTarget = targetAncestors.next();
		}

		if (target instanceof PseudoState && target.isHistory) {
			this.toEnter.pop();
		}
	}

	doExitSource(transaction: Transaction, history: boolean, trigger: any): void {
		this.toExit.doExit(transaction, history, trigger);
	}

	doEnterTarget(transaction: Transaction, history: boolean, trigger: any): void {
		this.toEnter.forEach((element, index) => element.doEnterHead(transaction, history, trigger, this.toEnter[index + 1]));
		this.toEnter[this.toEnter.length - 1].doEnterTail(transaction, history, trigger);
	}

	toString(): string {
		return "external";
	}
}


/**
 * Returns the ancestry of this element from the root element of the hierarchy to this element.
 * @returns Returns an iterable iterator used to process the ancestors.
 * @internal
 * @hidden
 */
function* ancestry(element: Region | Vertex): IterableIterator<NamedElement> {
	if (element.parent) {
		yield* ancestry(element.parent);
	}

	yield element;
}