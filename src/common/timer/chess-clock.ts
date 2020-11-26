import Timer from './timer';
import Mode from './mode';

interface MoveCount {
    white: number;
    black: number;
}

class ChessClock {
    private timerWhite: Timer;
    private timerBlack: Timer;
    private moveCount: MoveCount;
    private endCallback: (winner: string) => void;

    constructor(initMsBlack: number, initMsWhite: number, stepWhite: number, stepBlack: number, mode: Mode, endCallback: (winner: string) => void) {
        this.timerWhite = new Timer(mode, initMsWhite, stepWhite);
        this.timerBlack = new Timer(mode, initMsBlack, stepBlack);
        this.endCallback = endCallback;
        this.moveCount = {
            white: 0,
            black: 0
        }

        this.setCheckInterval();
    }

    startCountdown = () => {
        this.timerWhite.start();
    }

    switchClock = () => {
        if (this.timerWhite.isRunning()) {
            this.timerWhite.stop();
            this.timerBlack.start();
            this.moveCount.white++;
        } 
        else if (this.timerBlack.isRunning()) {
            this.timerBlack.stop();
            this.timerWhite.start();
            this.moveCount.black++;
        }
    }

    stopCountdown = () => {
        this.timerWhite.stop();
        this.timerBlack.stop();
    }

    getMoveCount = () => this.moveCount;

    getTimes = () => {
        return {
            timeWhite: this.timerWhite.getTime(),
            timeBlack: this.timerBlack.getTime()
        }
    }

    private setCheckInterval = () => {
        let interval = setInterval(() => {
            if(this.timerWhite.isFinished()) {
                this.stopCountdown();
                this.endCallback('black');
                clearInterval(interval);
            } 
            else if(this.timerBlack.isFinished()) {
                this.stopCountdown();
                this.endCallback('white');
                clearInterval(interval);
            }
        }, 250);
    }
};

export default ChessClock;