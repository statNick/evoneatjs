enum neuronPlace{
    INPUT=1,
    HIDDEN=2,
    OUTPUT=3
}

enum neuronType{
    BIAS=-1,
    NULL=0,
    SENSOR=1,
    NEURON=2
}

class Neuron{
    id: number;
    type: neuronType;
    place: neuronPlace;
    value: number=0;
    frame: number=0;
    linksIn: Array<Link>=[];

    constructor(what: neuronType, where: neuronPlace){
        this.type=what;
        this.place=where;
    }

    activation(){
        this.value=2/(1+Math.exp(-4.9*this.value))-1;
        return this.value;
    }
}

class Link{
    start: number;
    target: number;
    weight: number;

    constructor(s, t, w){
        this.start=s;
        this.target=t;
        this.weight=w;
    }
}

class Network{
    neurons: Array<Neuron>;
    frame: number=0;

    constructor(){
        this.neurons=Array<Neuron>();
        this.neurons[0]=new Neuron(neuronType.BIAS,neuronPlace.INPUT);
        this.neurons[0].value=1;

        for(let i=1; i<=nInputs; i++){
            this.neurons[i]=new Neuron(neuronType.SENSOR,neuronPlace.INPUT);
        }

        for(let o=1; o<=nOutputs; o++){
            this.neurons[nMaxHidden+nInputs+o]=new Neuron(neuronType.NEURON,neuronPlace.OUTPUT);
        }
    }

    private propagate(index: number): number{ //Calculates and returns the value of a neuron.
        if(this.neurons[index].place==neuronPlace.INPUT || this.neurons[index].frame==this.frame){
            return this.neurons[index].value;
        }
        else{
            let sum=0;
            this.neurons[index].frame=this.frame;
            for(let val of this.neurons[index].linksIn){
                sum+=val.weight*this.propagate(val.start);
            }
            this.neurons[index].value=sum;

            return this.neurons[index].activation();
        }
    }

    run(inputs: Array<number>): Array<number>{
        this.frame++;

        if(inputs.length!=nInputs){
            console.log("Invalid number of inputs given during network execution.");
            return ;
        }

        for(let i=1; i<=nInputs; i++){
            this.neurons[i].value=inputs[i-1];
        }

        let outputs=new Array<number>();
        for(let o=1; o<=nOutputs; o++){
            let current=nInputs+nMaxHidden+o;
            outputs.push(this.propagate(current));
        }

        return outputs;
    }
}
