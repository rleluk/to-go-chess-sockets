import Timer from './timer';
import ChessClockConfig from './chess-clock-config';

interface MoveCount {
    white: number;
    black: number;
}

class ChessClock {
    private timerWhite: Timer;
    private timerBlack: Timer;
    private moveCount: MoveCount;
    private endCallback: (winner: string) => void;
    private checkWinnerInterval: any = undefined;

    constructor(config: ChessClockConfig) {
        this.timerWhite = new Timer(config.mode, config.initMsWhite, config.stepWhite);
        this.timerBlack = new Timer(config.mode, config.initMsBlack, config.stepBlack);
        this.endCallback = config.endCallback;
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
        this.stopTimers();
        clearInterval(this.checkWinnerInterval);
    }

    getMoveCount = () => this.moveCount;

    getTimes = () => {
        return {
            timeWhite: this.timerWhite.getTime(),
            timeBlack: this.timerBlack.getTime()
        }
    }

    setTimes = (times: any) => {
        this.timerWhite.setTime(times.timeWhite.fullMs);
        this.timerBlack.setTime(times.timeBlack.fullMs);
    }

    private setCheckInterval = () => {
        this.checkWinnerInterval = setInterval(() => {
            if(this.timerWhite.isFinished()) {
                this.stopTimers();
                this.endCallback('black');
                clearInterval(this.checkWinnerInterval);
            } 
            else if(this.timerBlack.isFinished()) {
                this.stopTimers();
                this.endCallback('white');
                clearInterval(this.checkWinnerInterval);
            }
        }, 250);
    }

    private stopTimers = () => {
        this.timerWhite.stop();
        this.timerBlack.stop();
    }
};

export default ChessClock;