var cExcess = 10;
var cDisjoint = 10;
var cMatching = 10;
var deltaThreshold = 10;
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
var nodePlace;
(function (nodePlace) {
    nodePlace[nodePlace["INPUT"] = 1] = "INPUT";
    nodePlace[nodePlace["HIDDEN"] = 2] = "HIDDEN";
    nodePlace[nodePlace["OUTPUT"] = 3] = "OUTPUT";
})(nodePlace || (nodePlace = {}));
var nodeType;
(function (nodeType) {
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
    function network(inputs, maxhidden, outputs) {
        this.input = Array(inputs);
        this.hidden = Array(maxhidden);
        this.output = Array(outputs);
    }
    network.prototype.nodeRead = function (id) {
        var inlen = this.input.length;
        var hidlen = this.hidden.length;
        if (id < inlen) {
            return this.input[id];
        }
        else if (id < inlen + hidlen) {
            return this.hidden[id - inlen];
        }
        else {
            return this.output[id - (inlen + hidlen)];
        }
    };
    network.prototype.nodeWrite = function (node, id) {
        var inlen = this.input.length;
        var hidlen = this.hidden.length;
        node.id = id;
        if (id < inlen) {
            this.input[id] = node;
            return node;
        }
        else if (id < inlen + hidlen) {
            this.hidden[id - inlen] = node;
            return node;
        }
        else {
            this.output[id - (inlen + hidlen)] = node;
            return node;
        }
    };
    return network;
}());
var gene = (function () {
    function gene(i, st, en, we, n) {
        this.innovation = i;
        this.start = st;
        this.end = en;
        this.weight = we;
        this.enabled = n;
    }
    return gene;
}());
var organism = (function () {
    function organism() {
        this.genome = [];
        this.maxNeuron = 0;
        this.fitness = 0;
        this.adjFitness = 0;
    }
    organism.prototype.sort = function () {
        function compare(a, b) {
            return a.innovation - b.innovation;
        }
        this.genome.sort(compare);
    };
    organism.prototype.breed = function (other) {
        var p1 = this;
        var p2 = other;
        if (p1.fitness < p2.fitness) {
            swap(p1, p2);
        }
        var child = new organism();
        var i = 0;
        var j = 0;
        while (i < p1.genome.length && j < p2.genome.length) {
            while (i < p1.genome.length && j < p2.genome.length && p1.genome[i].innovation == p2.genome[j].innovation) {
                console.log("a " + i + " " + j);
                if (!p2.genome[j].enabled) {
                    child.genome.push(p2.genome[j]);
                }
                else {
                    child.genome.push(p1.genome[i]);
                }
                i++;
                j++;
            }
            while (i < p1.genome.length && p1.genome[i].innovation < p2.genome[j].innovation) {
                console.log("b " + i + " " + j);
                child.genome.push(p1.genome[i]);
                i++;
            }
            while (j < p2.genome.length && p1.genome[i].innovation > p2.genome[j].innovation) {
                console.log("c " + i + " " + j);
                child.genome.push(p2.genome[j]);
                j++;
            }
        }
        return child;
    };
    organism.prototype.generate = function (inputs, maxhidden, outputs) {
        this.phenome = new network(inputs, maxhidden, outputs);
        var net = this.phenome;
        var seq = this.genome;
        for (var i = 0; i < inputs; i++) {
            net.nodeWrite(new node(nodeType.SENSOR, nodePlace.INPUT), i);
        }
        for (var i = 0; i < seq.length; i++) {
            if (seq[i].enabled) {
                var s = net.nodeRead(seq[i].start);
                var e = net.nodeRead(seq[i].end);
                var w = seq[i].weight;
                if (s === undefined) {
                    s = new node(nodeType.NEURON, nodePlace.HIDDEN);
                }
                if (e === undefined) {
                    e = new node(nodeType.NEURON, nodePlace.HIDDEN);
                }
                var lnk = new link(s, e, w);
                e.nodesIn.push(lnk);
                s = net.nodeWrite(s, seq[i].start);
                e = net.nodeWrite(e, seq[i].end);
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
    return species;
}());
var generation = (function () {
    function generation() {
        this.innovationCount = 0;
    }
    generation.prototype.innovationCheck = function (gene) {
        var start = gene.start;
        var end = gene.end;
        if (this.innovations[start][end] === null || this.innovations[start][end] === undefined) {
            this.innovationCount++;
            this.innovations[start][end] = this.innovationCount;
            return this.innovationCount;
        }
        else {
            return this.innovations[start][end];
        }
    };
    return generation;
}());
var gn = new organism();
var a = new gene(0, 0, 1, 9, false);
var b = new gene(2, 0, 2, 3, true);
var c = new gene(8, 1, 2, 4, true);
var d = new gene(10, 2, 3, 5, true);
gn.genome = [a, b, c, d];
var gn2 = new organism();
gn2.fitness = 1;
var a = new gene(0, 0, 1, 8, true);
var b = new gene(1, 0, 2, 3, true);
var c = new gene(2, 1, 2, 92, true);
var d = new gene(11, 2, 3, 5, true);
gn2.genome = [a, b, c, d];
var gnc = gn.breed(gn2);
console.log(gnc);