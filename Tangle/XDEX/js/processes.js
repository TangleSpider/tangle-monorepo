let processes = {};

processes.init = function (name, func) {
    this[name] = {};
    this[name].queue = [];
    this[name].running = false;
    this[name].process = func;
    this[name].start = function () {
        if (this.running || !this.queue.length) return;
        this.running = true;
        this.process(this.queue[0]);
    };
    this[name].interval = setInterval(this[name].start.bind(this[name]), 1000);
}

module.exports = exports = processes;
