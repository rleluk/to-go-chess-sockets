import * as WebSocket from 'ws';
import SocketInfo from './socket-info';
import logger from './logger';


export default class GameSession {
    firstPlayer: SocketInfo;
    secondPlayer: SocketInfo;

    constructor(first: SocketInfo, second: SocketInfo) {
        this.firstPlayer = first;
        this.secondPlayer = second;
        logger.info(`Creating session (${this.firstPlayer.id}, ${this.secondPlayer.id}).`);

        this.firstPlayer.socket.on('message', (message) => {
            let msg = JSON.parse(String(message));
            if (msg.type === 'move') {
                console.log('player received ' + msg.move)
                this.secondPlayer.socket.send(JSON.stringify({type: 'receive', move: msg.move}));
            }
        });

        this.firstPlayer.socket.on('close', () => {
            logger.info(`Player ${this.firstPlayer.id} disconnected.`);
            this.secondPlayer.socket.send(JSON.stringify({type: 'opponentDisconnected'}));
        });

        this.secondPlayer.socket.on('message', (message) => {
            let msg = JSON.parse(String(message));
            if (msg.type === 'move') {
                console.log('player received ' + msg.move)
                this.firstPlayer.socket.send(JSON.stringify({type: 'receive', move: msg.move}));
            }
        });

        this.secondPlayer.socket.on('close', () => {
            logger.info(`Player ${this.secondPlayer.id} disconnected.`);
            this.firstPlayer.socket.send(JSON.stringify({type: 'opponentDisconnected'}));
        });
    }
}