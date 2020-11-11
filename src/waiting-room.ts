import * as WebSocket from 'ws';
import GameSession from './game-session';
import SocketInfo from './socket-info';
import logger from './logger';

export default class WaitingRoom {
    wss: WebSocket.Server;
    sockets: SocketInfo[] = [];
    sessions: GameSession[] = [];
    ID: number = 0;

    constructor(wss: WebSocket.Server) {
        this.wss = wss;

        wss.on('connection', (ws: WebSocket) => {
            this.checkSockets();
            const newSocket: SocketInfo = {
                id: this.ID, 
                socket: ws, 
                status: 'waiting'
            };

            this.sockets.push(newSocket);
            this.ID++;
            logger.info(`Connected with socket: ${newSocket.id}.`);
            logger.debug(`Number of connected sockets: ${this.sockets.length}.`)

            ws.on('close', () => {
                this.removeSocket(newSocket);
            });

            const waitingUsers = this.sockets.filter(socketInfo => socketInfo.status === 'waiting');
            if (waitingUsers.length % 2 == 0) {
                waitingUsers[0].status = 'inGame';
                waitingUsers[1].status = 'inGame';
                this.sessions.push(new GameSession(waitingUsers[0], waitingUsers[1]));
            }
        });
    }

    checkSockets() {
        logger.debug('Checking for closed sockets.');
        this.sockets.forEach(socketInfo => {
            if (socketInfo.socket.readyState === WebSocket.CLOSED || socketInfo.socket.readyState === WebSocket.CLOSING) {
                this.removeSocket(socketInfo);
            }
        });
    }

    removeSocket(socketInfo: SocketInfo) {
        logger.info(`Removing closed socket: ${socketInfo.id}.`)
        this.sockets = this.sockets.filter(si => socketInfo !== si);
        this.sessions = this.sessions.filter(session => session.firstPlayer !== socketInfo && session.secondPlayer !== socketInfo);  
    }
}