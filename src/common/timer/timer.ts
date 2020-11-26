import Mode from './mode';

class Timer {
    private ms: number;
    private step: number;
    private initMs: number;
    private interval: any;
    private running: boolean;
    private finished: boolean;
    private mode: Mode;

    constructor(mode: Mode, initMs: number, step: number = 1) {
        this.ms = initMs;
        this.initMs = initMs;
        this.step = step;
        this.mode = mode;
    }

    start = () => {
        if (this.mode.type === 'fisher') {
            this.ms += this.mode.toAdd;
        }

        this.running = true;
        this.interval = setInterval(() => {
            this.ms -= this.step;
            if (this.ms <= 0) {
                this.finished = true;
                clearInterval(this.interval);
            }
        }, 1);
    }

    stop = () => {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
            this.running = false;
        }
    }

    restart = () => {
        this.stop();
        this.ms = this.initMs;
        this.start();
    }

    getTime = () => {
        let ms = this.ms % 1000;
        let seconds = Math.floor(this.ms / 1000);
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        return {
            minutes,
            seconds,
            ms
        };
    }

    getInitTime = () => this.initMs;

    getStep = () => this.step;

    isRunning = () => this.running;
    
    isFinished = () => this.finished;
    
    setStep = (step: number) => {
        this.step = step;
    }
};

export default Timer;