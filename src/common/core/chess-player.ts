import { Subject } from "rxjs";
import { Player } from "../interfaces/player";

export class ChessPlayer implements Player {
    color: 'white' | 'black';
    emitMove: Subject<string> = new Subject<string>();

    move(move: string) {
        this.emitMove.next(move);
    }

    receiveMove(move: string) {}
}



