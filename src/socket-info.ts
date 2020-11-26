import * as WebSocket from 'ws';
import {ChessPlayer} from "./common/core/chess-player";
import {BoardInfo} from "./common/core/board-info";

export default class SocketInfo extends ChessPlayer {
    id: number;
    socket: WebSocket;
    status: 'inGame' | 'waiting';

    constructor(data) {
        super();
        this.id = data.id;
        this.socket = data.socket;
        this.status = data.status;
    }

    setBoardInfo = (boardInfo: BoardInfo) => {}
    makeFirstMove = () => {}

    socketMove = (move: string) => {
        this.move(move);
    }
}