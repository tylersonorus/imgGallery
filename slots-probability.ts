//type RuleFunction = (prevSlot:Slot,curSlot:Slot, position: number) => boolean;

interface RulePattern {
	name: string;
	pattern: (string | number)[];
}

interface Distribution {
	start: number;
	end: number;
}

interface Statistics {
	[lineType: string]: { [lineNumber: string]: number };
}

interface Subline {
    parentLine:string;
    childLine:string;
}

enum LineTypes {
	ShortLine = 1,
	MediumLine = 2,
	LongLine = 3,
}

let longLinePatterns: RulePattern[] = [
	{ name: 'firstLine', pattern: [0, 0, 0, 0, 0] },
	{ name: 'secondLine', pattern: [1, 1, 1, 1, 1] },
	{ name: 'thirdLine', pattern: [2, 2, 2, 2, 2] },
	{ name: 'vLine', pattern: [0, 1, 2, 1, 0] },
	{ name: 'rotateVLine', pattern: [2, 1, 0, 1, 2] },
	{ name: 'downUpZline', pattern: [2, 2, 1, 0, 0] },
	{ name: 'upDownZline', pattern: [0, 0, 1, 2, 2] },
	//    { name: 'smallline', pattern: [0, 0, "*", '*', '*'] },
];

let mediumLinePatterns: RulePattern[] = [
	{ name: 'mediumFirstLine', pattern: [0, 0, 0, 0, '*'] },
	{ name: 'mediumSecondLine', pattern: [1, 1, 1, 1, '*'] },
	{ name: 'mediumThirdLine', pattern: [2, 2, 2, 2, '*'] }
	//    { name: 'smallline', pattern: [0, 0, "*", '*', '*'] },
];

let smallLinePatterns: RulePattern[] = [
	{ name: 'smallFirstLine', pattern: [0, 0, 0, '*', '*'] },
	{ name: 'smallSecondLine', pattern: [1, 1, 1, '*', '*'] },
	{ name: 'smallThirdLine', pattern: [2, 2, 2, '*', '*'] }
	//    { name: 'smallline', pattern: [0, 0, "*", '*', '*'] },
];

let sublineList: Subline[] = [
    {parentLine:'firstLine',childLine:'mediumFirstLine'},
    {parentLine:'secondLine',childLine:'mediumSecondLine'},
    {parentLine:'thirdLine',childLine:'mediumThirdLine'},
    {parentLine:'mediumFirstLine',childLine:'smallFirstLine'},
    {parentLine:'mediumSecondLine',childLine:'smallSecondLine'},
    {parentLine:'mediumThirdLine',childLine:'smallThirdLine'},
]


class SlotSymbol {
	public distribution: Distribution = <Distribution>{};
	static getSymbolByDistributionPoint(
		symbols: SlotSymbol[],
		distributionPoint: number
	) {
		return symbols.find((el) => {
			if (
				el.distribution.start < distributionPoint &&
				el.distribution.end >= distributionPoint
			)
				return true;
			return false;
		});
	}
	static setDistribution(symbols: SlotSymbol[]) {
		let bias = 0;
		let caseNumber = symbols.reduce(
			(accum, symbol) => (accum += symbol.frequency),
			0
		);
		symbols.forEach((el) => {
			let probability = el.frequency / caseNumber;
			el.distribution = { start: bias, end: bias + probability };
			bias += probability;
		});
	}
	constructor(
		public name: string,
		public isEqual: (arg: SlotSymbol) => boolean,
		public frequency: number = 1
	) {}
}

class Slot {
    [id:number]:SlotSymbol;
	constructor(private symbols: SlotSymbol[], public slotLength: number) {
		for (let i = 0; i < slotLength; i++) {
			this[i] = <SlotSymbol>null;
		}
	}
	public generate() {
		let i = 0;
		while (this.hasOwnProperty(i)) {
			this[i] = SlotSymbol.getSymbolByDistributionPoint(
				this.symbols,
				Math.random()
			);
			i++;
		}
		return this;
	}

	public printSlot() {
		for (let i = 0; i < this.slotLength; i++) console.log(this[i].name);
    }
    public getSymbolName(slotNumber) {
        return this[slotNumber].name;
    }
}

class SlotAnalysis {
	slots: Slot[] = [];
	private curStatistic;
	private lineTypes: LineTypes[] = [];
	public statistics: Statistics = <Statistics>{};
	constructor(
		private slotLength: number,
		private slotMachineLength: number,
		private symbols: SlotSymbol[],
		private rules: Rule[],
		private subLineList:Subline[],
		public stopIterate: number,
	) {
		SlotSymbol.setDistribution(this.symbols);
		for (let i = 0; i < this.slotMachineLength; i++) {
			this.slots.push(new Slot(this.symbols, this.slotLength));
		}
		this.setRuleTypes();
		for (let lineType of this.lineTypes) {
            let i = 0;
            this.statistics[lineType]={};
			for (let rule of this.rules) {
				if (rule.type === lineType) {
					this.statistics[lineType][i] = 0;
					i++;
				}
            }
            this.statistics[lineType][i] = 0;
        }
	}
	private prepareIteration() {
		this.rules.forEach((rule) => (rule.state = true));
		for (let i = 0; i < this.slotMachineLength; i++) {
			this.slots[i].generate();
		}
	}
	private setRuleTypes() {
		this.rules.forEach((rule) => {
			let typeIndex = this.lineTypes.findIndex((type) => type === rule.type);
			if (typeIndex === -1) {
				this.lineTypes.push(rule.type);
			}
		});
	}
	private iteration() {
		this.prepareIteration();
		for (let i = 1; i < this.slotMachineLength; i++) {
			this.slots[i];
			this.rules.forEach((rule) => {
				rule.updateState(this.slots[i - 1], this.slots[i], i);
			});
		}
		//this.printSlots();
	}

	isWinLineChild(rule: Rule){
		for (const subline of this.subLineList) {
			if(subline.childLine === rule.name) {
				let parentRule = this.rules.find(rule=>rule.name === subline.parentLine)
				if (parentRule.state) return true;
			}
		}
		return false;
	}

	calcIterationResult() {
		//let linesNumber = this.rules.reduce((acc, rule) => (acc += +rule.state), 0);
		for (const type of this.lineTypes) {
			let i = 0;
			for (const rule of this.rules) {
				if (rule.type === type && rule.state && !this.isWinLineChild(rule)) {
					i++;
				}
            }
            this.statistics[type][i] += 1;
		}
	}

	public run() {
		for (let i = 0; i < this.stopIterate; i++) {
			this.iteration();
			this.calcIterationResult();
		}
	}

	public printSlots() {
        for (let lineNumber = 0; lineNumber < this.slotLength; lineNumber++) {
            let line='';
            for (let  colNumber= 0; colNumber < this.slotMachineLength; colNumber++) {
                line+=this.slots[colNumber].getSymbolName(lineNumber)+' ';
            }
            console.log(line);
        }
		console.log('----------------');
	}
}

class Rule {
	public state = true;
	public name: string;

	constructor(private rulePattern: RulePattern, public type: LineTypes) {
		this.name = rulePattern.name;
	}
	updateState(prevSlot: Slot, curSlot: Slot, position: number) {
		if (!this.state) return;
		if (this.rulePattern.pattern[position] !== '*') {
			let isEqual = (<SlotSymbol>(
				curSlot[this.rulePattern.pattern[position]]
			)).isEqual(prevSlot[this.rulePattern.pattern[position - 1]]);
			if (isEqual) {
				return (this.state = true);
			}
			return (this.state = false);
		}
		return (this.state = true);
	}
}

let slotSymbols: SlotSymbol[] = [
	new SlotSymbol(
		'A',
		function (symbol: SlotSymbol) {
			if (symbol.name === this.name) {
				return true;
			}
			return false;
		},
		1
	),
	new SlotSymbol(
		'B',
		function (symbol: SlotSymbol) {
			if (symbol.name === this.name) {
				return true;
			}
			return false;
		},
		1
	),
	new SlotSymbol(
		'C',
		function (symbol: SlotSymbol) {
			if (symbol.name === this.name) {
				return true;
			}
			return false;
		},
		1
	),
];

let longLineRules: Rule[] = longLinePatterns.map((pattern) => new Rule(pattern,LineTypes.LongLine));
let mediumLineRules: Rule[] = mediumLinePatterns.map((pattern) => new Rule(pattern,LineTypes.MediumLine));
let smallLineRules: Rule[] = smallLinePatterns.map((pattern) => new Rule(pattern,LineTypes.ShortLine));

let slotAnalysis = new SlotAnalysis(3, 5, slotSymbols, [...smallLineRules,...mediumLineRules,...longLineRules],sublineList, 100000000);
//let slotAnalysis = new SlotAnalysis(3, 5, slotSymbols, [...longLineRules], 1000);
slotAnalysis.run();
// for (let key in slotAnalysis.statistics) {
// 	if (slotAnalysis.statistics.hasOwnProperty(key))
// 		slotAnalysis.statistics[key] =
// 			slotAnalysis.statistics[key] / slotAnalysis.stopIterate;
// }
console.log(slotAnalysis.statistics);
