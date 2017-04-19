class Species {
	members: Array<Organism> = [];
	avgFitness: number = 0;
	sorted: boolean = true;
	stagnant: number = 0;
	maxFitness: number = 0;

	constructor() {}

	cull(allButTop: boolean): number {
		this.sortByFitness();

		if (allButTop) {
			this.members = this.members.slice(0, 1);
		}
		else {
			let oglen = this.members.length;
			while (this.members.length > Math.ceil(experiment.config.cCull * oglen)) {
				this.members.pop();
			}
		}

		return this.members.length;
	}

	sortByFitness() {
		if (!this.sorted) {
			this.members.sort((a, b) => b.getFitness() - a.getFitness());
			this.sorted = true;
		}
	}

	breed() {
		let child: Organism;
		if (Math.random() < experiment.config.pCrossover) {
			let p1 = randEntry(this.members);
			let p2 = randEntry(this.members);
			child = p1.crossover(p2);
		}
		else {
			child = randEntry(this.members).clone();
		}

		child.mutate();
		return child;
	}

	compatible(guy: Organism) {
		return this.members[0].compatible(guy);
	}

	addMember(newMember: Organism) {
		this.members.push(newMember.clone());
		this.sorted = false;
		//insertionSort(newMember, this.members, function(a: Organism,b: Organism){return a.getFitness>b.getFitness;});
	}

	getAvgFitness(): number {
		this.avgFitness = 0;
		for (let val of this.members) {
			this.avgFitness += val.getFitness();
		}
		this.avgFitness /= this.members.length;

		return this.avgFitness;
	}
}