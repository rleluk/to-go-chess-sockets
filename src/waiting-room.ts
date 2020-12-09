import * as WebSocket from 'ws';
import GameSession from './game-session';
import SocketInfo from './socket-info';
import {StockfishPlayer} from "./common/core/stockfish-player";
import ChessClockConfig from "./common/timer/chess-clock-config";

// import logger from './logger';

const clockConfig: ChessClockConfig = {
    initMsBlack: 300 * 1000,
    initMsWhite: 300 * 1000,
    stepBlack: 1,
    stepWhite: 1,
    mode: {
      type: 'standard',
      toAdd: 5000
    },
    endCallback: (winner: string) => {}   
}
  

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
    whiteStandardQueue: SocketInfo[] = [];
    blackStandardQueue: SocketInfo[] = [];
    bothStandardQueue: SocketInfo[] = [];
    whiteFischerQueue: SocketInfo[] = [];
    blackFischerQueue: SocketInfo[] = [];
    bothFischerQueue: SocketInfo[] = [];
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
                    if (msg.clockType === 'fischer') {
                        let players = this.newGame(this.whiteFischerQueue, this.blackFischerQueue, this.bothFischerQueue, newSocket, msg);
                        let white = players.white;
                        let black = players.black;

                        if (white && black) {
                            this.whiteFischerQueue = this.whiteFischerQueue.filter(socket => socket !== white && socket !== black);
                            this.blackFischerQueue = this.blackFischerQueue.filter(socket => socket !== white && socket !== black);
                            this.bothFischerQueue = this.bothFischerQueue.filter(socket => socket !== white && socket !== black);
                            let cConfig = {...clockConfig};
                            cConfig.mode.type = 'fischer';
                            this.sessions.push(new GameSession(white, black, clockConfig));
                        }
                    } else {
                        let players = this.newGame(this.whiteStandardQueue, this.blackStandardQueue, this.bothStandardQueue, newSocket, msg);
                        let white = players.white;
                        let black = players.black;
    
                        if (white && black) {
                            this.whiteStandardQueue = this.whiteStandardQueue.filter(socket => socket !== white && socket !== black);
                            this.blackStandardQueue = this.blackStandardQueue.filter(socket => socket !== white && socket !== black);
                            this.bothStandardQueue = this.bothStandardQueue.filter(socket => socket !== white && socket !== black);
                            let cConfig = {...clockConfig};
                            cConfig.mode.type = 'standard';
                            this.sessions.push(new GameSession(white, black, clockConfig));
                        }
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

    newGame(whiteQueue: SocketInfo[], blackQueue: SocketInfo[], bothQueue: SocketInfo[], newSocket: any, msg: any) {
        switch (msg.color) {
            case 'white':
                whiteQueue.push(newSocket);
                break;
            case 'black':
                blackQueue.push(newSocket);
                break;
            default:
                bothQueue.push(newSocket);
        }

        let white = whiteQueue[0];
        let black = blackQueue[0];

        let i = 0;
        if (!white) {
            white = bothQueue[i];
            i++;
        }
        if (!black) black = bothQueue[i];

        return {
            white, 
            black
        };
    }

    removeSocket(socketInfo: SocketInfo) {
        // logger.info(`Removing closed socket: ${socketInfo.id}.`)
        this.sockets = this.sockets.filter(si => socketInfo !== si);
        this.sessions = this.sessions.filter(session => session.firstPlayer !== socketInfo && session.secondPlayer !== socketInfo);
        this.whiteStandardQueue = this.whiteStandardQueue.filter(socket => socket !== socketInfo);
        this.blackStandardQueue = this.blackStandardQueue.filter(socket => socket !== socketInfo);
        this.bothStandardQueue = this.bothStandardQueue.filter(socket => socket !== socketInfo);
        this.whiteFischerQueue = this.whiteFischerQueue.filter(socket => socket !== socketInfo);
        this.blackFischerQueue = this.blackFischerQueue.filter(socket => socket !== socketInfo);
        this.bothFischerQueue = this.bothFischerQueue.filter(socket => socket !== socketInfo);
    }
}