import ChessClock from './chess-clock';
import ChessClockConfig from './chess-clock-config';

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const callback = (winner) => {
    console.log(winner);
}

let mode = {
    type: 'standard',
}

// let mode = {
//     type: 'fischer',
//     toAdd: 10000
// }

const config: ChessClockConfig = {
    initMsBlack: 40000,
    initMsWhite: 40000,
    stepBlack: 1,
    stepWhite: 1,
    mode: mode,
    endCallback: callback
}

let clock = new ChessClock(config);
clock.startCountdown();  
console.log(clock.getTimes());
sleep(5000).then(() => {
    clock.switchClock();
    console.log(clock.getTimes());
    sleep(5000).then(() => {
        clock.switchClock();
        console.log(clock.getTimes());
        sleep(5000).then(() => {
            clock.switchClock();
            console.log(clock.getTimes());
            sleep(5000).then(() => {
                clock.switchClock();
                console.log(clock.getTimes());
                sleep(5000).then(() => {
                    clock.switchClock();
                    console.log(clock.getTimes());
                    clock.stopCountdown();
                });
            });
        });
    }); 
});