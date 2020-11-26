import SocketInfo from './socket-info';
import {Chessboard} from "./common/core/chessboard";
import {Game} from "./common/core/game";
// import logger from './logger';


export default class GameSession {
    firstPlayer: SocketInfo;
    secondPlayer: SocketInfo;
    game: Game;
    board: Chessboard;

    constructor(first: SocketInfo, second: SocketInfo) {
        this.firstPlayer = first;
        this.secondPlayer = second;

        this.board = new Chessboard();
        this.game = new Game();
        this.game.init({canvas: this.board, whitePlayer: first, blackPlayer: second});
        first.setBoardInfo(this.game.getBoardInfo());
        second.setBoardInfo(this.game.getBoardInfo());

        // logger.info(`Creating session (${this.firstPlayer.id}, ${this.secondPlayer.id}).`);

        this.firstPlayer.status = 'inGame';
        this.secondPlayer.status = 'inGame';

        console.log('sessionStarted')

        const startMessage = JSON.stringify({type: 'sessionStarted'});
        this.firstPlayer.socket.send(JSON.stringify({type: 'config', color: 'white'}));
        this.secondPlayer.socket.send(JSON.stringify({type: 'config', color: 'black'}));
        this.firstPlayer.makeFirstMove();

        this.firstPlayer.socket.on('message', (message) => {
            let msg = JSON.parse(String(message));
            if (msg.type === 'move') {
                this.firstPlayer.socketMove(msg.move);
                this.secondPlayer.socket.send(JSON.stringify({type: 'receive', move: msg.move}));
            }
        });

        this.firstPlayer.socket.on('close', () => {
            // logger.info(`Player ${this.firstPlayer.id} disconnected.`);
            this.secondPlayer.socket.send(JSON.stringify({type: 'opponentDisconnected'}));
        });

        this.secondPlayer.socket.on('message', (message) => {
            let msg = JSON.parse(String(message));
            if (msg.type === 'move') {
                this.secondPlayer.socketMove(msg.move);
                this.firstPlayer.socket.send(JSON.stringify({type: 'receive', move: msg.move}));
            }
        });

        this.secondPlayer.socket.on('close', () => {
            // logger.info(`Player ${this.secondPlayer.id} disconnected.`);
            this.firstPlayer.socket.send(JSON.stringify({type: 'opponentDisconnected'}));
        });
    }
}