var nInputs = 5;
var nMaxHidden = 40;
var nOutputs = 4;
var cExcess = 1.0;
var cDisjoint = 1.0;
var cMatching = 0.4;
var cSmallGenome = 20;
var cCull = 0.2;
var cCrossover = 0.75;
var deltaThreshold = 10;
var pDisable = 0.75;
var pPerturb = 0.8;
var pPerturbUniform = 0.9;
var pLink = 0.2;
var pNode = 0.1;
var pKeepNotFit = 0.5;
var inputs = 5;
function newWeight() {
    return Math.random() * 4 - 2;
}
var innovations = new Array();
var innovationCount = 0;
function innovationCheck(gene) {
    var start = gene.start;
    var end = gene.end;
    if (this.innovations[start][end] === null || this.innovations[start][end] === undefined) {
        this.innovationCount++;
        this.innovations[start][end] = this.innovationCount;
    }
    return this.innovations[start][end];
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function swap(a, b) {
    var temp = a;
    a = b;
    b = a;
}
function binarySearch(l, r, key, query) {
    if (l > r) {
        return [l, r];
    }
    var m = Math.floor(l + (r - l) / 2);
    var q = query(m);
    if (key == q) {
        return m;
    }
    else if (key < q) {
        return binarySearch(l, m - 1, key, query);
    }
    else {
        return binarySearch(m + 1, r, key, query);
    }
}
function insertionSort() {
}
var nodePlace;
(function (nodePlace) {
    nodePlace[nodePlace["INPUT"] = 1] = "INPUT";
    nodePlace[nodePlace["HIDDEN"] = 2] = "HIDDEN";
    nodePlace[nodePlace["OUTPUT"] = 3] = "OUTPUT";
})(nodePlace || (nodePlace = {}));
var nodeType;
(function (nodeType) {
    nodeType[nodeType["BIAS"] = -1] = "BIAS";
    nodeType[nodeType["NULL"] = 0] = "NULL";
    nodeType[nodeType["SENSOR"] = 1] = "SENSOR";
    nodeType[nodeType["NEURON"] = 2] = "NEURON";
})(nodeType || (nodeType = {}));
var node = (function () {
    function node(what, where) {
        this.value = 0;
        this.type = what;
        this.place = where;
        this.nodesIn = new Array();
    }
    node.prototype.sigmoid = function (x) {
        return 2 / (1 + Math.exp(-4.9 * x)) - 1;
    };
    return node;
}());
var link = (function () {
    function link(i, o, w) {
        this.in = i;
        this.out = o;
        this.weight = w;
    }
    return link;
}());
var network = (function () {
    function network() {
        this.nodes = Array();
        this.nodes[0] = new node(nodeType.BIAS, nodePlace.INPUT);
        for (var i = 1; i < nInputs; i++) {
            this.nodes[i] = new node(nodeType.SENSOR, nodePlace.INPUT);
        }
        for (var o = 1; o < nOutputs; o++) {
            this.nodes[nMaxHidden + o] = new node(nodeType.NEURON, nodePlace.OUTPUT);
        }
    }
    return network;
}());
var gene = (function () {
    function gene(s, t, w, e) {
        this.start = s;
        this.end = t;
        this.weight = w;
        this.enabled = e;
        this.innovation = innovationCheck(this);
    }
    gene.prototype.perturb = function () {
        if (Math.random() < pPerturb) {
            if (Math.random() < pPerturbUniform) {
                this.weight *= Math.random();
            }
            else {
                this.weight = newWeight();
            }
        }
    };
    return gene;
}());
var organism = (function () {
    function organism() {
        this.genome = [];
        this.fitness = 0;
        this.adjFitness = 0;
    }
    organism.prototype.sort = function () {
        function compare(a, b) {
            return a.innovation - b.innovation;
        }
        this.genome.sort(compare);
    };
    organism.prototype.crossover = function (other) {
        var p1 = this;
        var p2 = other;
        if (p1.fitness < p2.fitness) {
            swap(p1, p2);
        }
        var child = new organism();
        child.innovationMin = Math.min(p1.innovationMin, p2.innovationMin);
        child.innovationMax = Math.max(p1.innovationMax, p2.innovationMax);
        var match = new Array();
        for (var _i = 0, _a = p2.genome; _i < _a.length; _i++) {
            var val = _a[_i];
            match[val.innovation] = val;
        }
        for (var _b = 0, _c = p1.genome; _b < _c.length; _b++) {
            var val = _c[_b];
            var push = val;
            if (match[val.innovation] != undefined) {
                if (Math.random() < pKeepNotFit) {
                    push = match[val.innovation];
                }
                push.enabled = !((!val.enabled || !match[val.innovation].enabled) && Math.random() < pDisable);
            }
            child.innovationMin = Math.min(child.innovationMin, push.innovation);
            child.innovationMax = Math.max(child.innovationMin, push.innovation);
            child.genome.push(push);
        }
        return child;
    };
    organism.prototype.compatibility = function (other) {
        var dis = 0;
        var exc = 0;
        var mat = 0;
        var wDif = 0;
        var exists = new Array();
        var matching = new Array();
        for (var _i = 0, _a = other.genome; _i < _a.length; _i++) {
            var val = _a[_i];
            exists[val.innovation] = val.weight;
        }
        for (var _b = 0, _c = this.genome; _b < _c.length; _b++) {
            var val = _c[_b];
            if (val.innovation < other.innovationMin || val.innovation > other.innovationMax) {
                exc++;
            }
            else {
                if (exists[val.innovation] == undefined) {
                    dis++;
                }
                else {
                    wDif += Math.abs(val.weight - exists[val.innovation]);
                    mat++;
                    matching[val.innovation] = true;
                }
            }
        }
        for (var _d = 0, _e = other.genome; _d < _e.length; _d++) {
            var val = _e[_d];
            if (val.innovation < this.innovationMin || val.innovation > this.innovationMax) {
                exc++;
            }
            else if (matching[val.innovation] != true) {
                dis++;
            }
        }
        var maxlen = Math.max(this.genome.length, other.genome.length);
        var N = (maxlen > cSmallGenome) ? maxlen : 1;
        return (cDisjoint * dis / N) + (cExcess * exc / N) + (cMatching * wDif / mat);
    };
    organism.prototype.addLink = function (s, t, weight) {
        var gen = new gene(s, t, weight, true);
        this.genome.push(gen);
    };
    organism.prototype.randomNode = function (notInput) {
        var exists = new Array();
        var count = 0;
        if (!notInput) {
            for (var i = 0; i < nInputs; i++) {
                exists[i] = true;
                count++;
            }
        }
        for (var o = 1; o < nOutputs; o++) {
            exists[nMaxHidden + o] = true;
            count++;
        }
        for (var _i = 0, _a = this.genome; _i < _a.length; _i++) {
            var val = _a[_i];
            if (!(val.start <= nInputs && notInput)) {
                if (!exists[val.start])
                    count++;
                exists[val.start] = true;
            }
            if (!(val.end <= nInputs && notInput)) {
                if (!exists[val.end])
                    count++;
                exists[val.end] = true;
            }
        }
        var index = randInt(0, count);
        for (var val in exists) {
            index--;
            if (index == 0) {
                return parseInt(val);
            }
        }
    };
    organism.prototype.addNode = function (index) {
        this.genome[index].enabled = false;
        var newNode = this.randomNode(true);
        this.addLink(this.genome[index].start, newNode, this.genome[index].weight);
        this.addLink(newNode, this.genome[index].end, newWeight);
    };
    organism.prototype.perturbLinks = function () {
        for (var _i = 0, _a = this.genome; _i < _a.length; _i++) {
            var val = _a[_i];
            val.perturb();
        }
    };
    organism.prototype.mutate = function () {
        this.perturbLinks();
    };
    organism.prototype.generate = function () {
        this.phenome = new network;
        for (var i = 0; i < this.genome.length; i++) {
            if (this.genome[i].enabled) {
                var s = this.phenome.nodes[this.genome[i].start];
                var e = this.phenome.nodes[this.genome[i].end];
                var w = this.genome[i].weight;
                if (s === undefined) {
                    s = new node(nodeType.NEURON, nodePlace.HIDDEN);
                }
                if (e === undefined) {
                    e = new node(nodeType.NEURON, nodePlace.HIDDEN);
                }
                var lnk = new link(s, e, w);
                e.nodesIn.push(lnk);
                this.phenome.nodes[this.genome[i].start] = s;
                this.phenome.nodes[this.genome[i].end] = e;
            }
        }
    };
    organism.prototype.evaluate = function () {
    };
    return organism;
}());
var species = (function () {
    function species() {
    }
    species.prototype.cull = function () {
        function compare(a, b) {
            return a.fitness - b.fitness;
        }
        this.members.sort(compare);
        var len = this.members.length;
        while (this.members.length > cCull * len) {
            this.members.pop();
        }
    };
    species.prototype.breed = function () {
        var child;
        if (Math.random() < cCrossover) {
            var p1 = this.members[randInt(0, this.members.length - 1)];
            var p2 = this.members[randInt(0, this.members.length - 1)];
            child = p1.crossover(p2);
        }
        else {
            child = this.members[randInt(0, this.members.length - 1)];
        }
        child.mutate();
        return child;
    };
    return species;
}());
var generation = (function () {
    function generation() {
    }
    return generation;
}());
