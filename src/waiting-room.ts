import * as WebSocket from 'ws';
import GameSession from './game-session';
import SocketInfo from './socket-info';
import {StockfishPlayer} from "./common/core/stockfish-player";
import {Game} from "./common/core/game";
import {ChessPlayer} from "./common/core/chess-player";
import {Chessboard} from "./common/core/chessboard";
// import logger from './logger';

class AiPlayer extends StockfishPlayer {
    id = -1;
    status: "inGame" | "waiting" = "inGame";
    stockfish: any;
    re = RegExp(/bestmove (\w+)/);

    socket = {
        on: (event: string, callback: any) => {
            switch (event) {
                case 'message':
                    this.onMessage = callback;
                    break;
                case 'close':
                    this.onClose = callback;
                    break;
            }
        },
        send: (message: string) => {
            const data = JSON.parse(message);
            if (data.type === 'receive') {
                this.receiveMove(data.move);
            }
        }
    } as WebSocket;

    move(move: string) {
        this.emitMove.next(move);
        this.onMessage(JSON.stringify({type: 'move', move}));
    }

    socketMove = (move: string) => {}

    onMessage = (message: string) => {};
    onClose = () => {};
}

export default class WaitingRoom {
    wss: WebSocket.Server;
    sockets: SocketInfo[] = [];
    sessions: GameSession[] = [];
    whiteQueue: SocketInfo[] = [];
    blackQueue: SocketInfo[] = [];
    bothQueue: SocketInfo[] = [];
    ID: number = 0;

    constructor(wss: WebSocket.Server) {
        this.wss = wss;

        wss.on('connection', (ws: WebSocket) => {
            const newSocket = new SocketInfo({
                id: this.ID, 
                socket: ws, 
                status: 'waiting',
            });

            this.sockets.push(newSocket);
            this.ID++;
            // logger.info(`Connected with socket: ${newSocket.id}.`);
            // logger.debug(`Number of connected sockets: ${this.sockets.length}.`)

            ws.on('close', () => {
                this.removeSocket(newSocket);
            });

            ws.on('message', (message) => {
                let msg = JSON.parse(String(message));
                if (msg.type === 'newGame') {
                    if (msg.color === 'white') {
                        this.whiteQueue.push(newSocket);
                    }
                    else if (msg.color === 'black') {
                        this.blackQueue.push(newSocket);
                    }
                    else {
                        this.bothQueue.push(newSocket);
                    }

                    let white = this.whiteQueue[0];
                    let black = this.blackQueue[0];

                    let i = 0;
                    if (!white) {
                        white = this.bothQueue[i];
                        i++;
                    }
                    if (!black) black = this.bothQueue[i];

                    if (white && black) {
                        this.whiteQueue = this.whiteQueue.filter(socket => socket !== white && socket !== black);
                        this.blackQueue = this.blackQueue.filter(socket => socket !== white && socket !== black);
                        this.bothQueue = this.bothQueue.filter(socket => socket !== white && socket !== black);
                        this.sessions.push(new GameSession(white, black));
                    }

                }
                else if (msg.type === 'newAiGame') {
                    let color = msg.color;
                    if (color !== 'white' && color !== 'black') {
                        color = Math.random() > 0.5 ? 'white' : 'black';
                    }
                    if (color === 'white') {
                        this.sessions.push(new GameSession(newSocket, new AiPlayer(15)));
                    }
                    else {
                        this.sessions.push(new GameSession(new AiPlayer(15), newSocket));
                    }
                }
            })

        });

    }


    removeSocket(socketInfo: SocketInfo) {
        // logger.info(`Removing closed socket: ${socketInfo.id}.`)
        this.sockets = this.sockets.filter(si => socketInfo !== si);
        this.sessions = this.sessions.filter(session => session.firstPlayer !== socketInfo && session.secondPlayer !== socketInfo);
        this.whiteQueue = this.whiteQueue.filter(socket => socket !== socketInfo);
        this.blackQueue = this.blackQueue.filter(socket => socket !== socketInfo);
        this.bothQueue = this.bothQueue.filter(socket => socket !== socketInfo);
    }
}