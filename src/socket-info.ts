import * as WebSocket from 'ws';

export default interface SocketInfo {
    id: number;
    socket: WebSocket;
    status: 'inGame' | 'waiting';
}