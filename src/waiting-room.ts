import * as WebSocket from 'ws';
import GameSession from './game-session';
import SocketInfo from './socket-info';
// import logger from './logger';

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
            const newSocket: SocketInfo = {
                id: this.ID, 
                socket: ws, 
                status: 'waiting'
            };

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