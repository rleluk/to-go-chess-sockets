import { Subject } from 'rxjs';

export interface Player {
	color: 'white' | 'black';
	emitMove: Subject<string>;
	move(move: string): void;
	receiveMove(move: string): void;
}
