import { Subject } from "rxjs";
import { Player } from "../interfaces/player";

export class SocketPlayer implements Player {
    color: 'white' | 'black';
    emitMove: Subject<string> = new Subject<string>();
    webSocket: WebSocket;

    constructor(ws: WebSocket) {
        this.webSocket = ws;
        ws.onmessage = (event) => {
            let msg = JSON.parse(String(event.data));
            if (msg.type === 'receive') {
                this.move(msg.move);
            }
        };
    }

    move(move: string) {
        this.emitMove.next(move);
    }

    receiveMove(move: string) {
        this.webSocket.send(JSON.stringify({type: 'move', move: move}));
    }
}
