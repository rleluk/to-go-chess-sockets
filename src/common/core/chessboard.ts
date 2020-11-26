import { Canvas } from '../interfaces/canvas';

export class Chessboard implements Canvas {
    positionFEN: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    callback = (newPosition: string) => {};

    draw(newPosition: string) {
        this.positionFEN = newPosition;
        this.callback(newPosition);
    }
}
