import ChessClock from './chess-clock';

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
//     type: 'fisher',
//     toAdd: 10000
// }

let clock = new ChessClock(50000, 40000, 5, 1, mode, callback);
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
                });
            });
        });
    }); 
});