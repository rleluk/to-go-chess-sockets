import { BoardInfo } from "../core/board-info";
import { Move } from "./move";
import { PieceConfig } from "./piece-config";
import { Piece } from "./piece";

export class Knight extends Piece {
    symbol = 'n';

    possibleMoves(boardInfo: BoardInfo): Move[] {
        let moves: Move[] = [];
        let row = this.row;
        let column = this.column;
        this.pushMove(boardInfo, moves, row + 2, column + 1);
        this.pushMove(boardInfo, moves, row + 2, column -1);
        this.pushMove(boardInfo, moves, row - 2, column + 1);
        this.pushMove(boardInfo, moves, row - 2, column - 1);
        this.pushMove(boardInfo, moves, row + 1, column + 2);
        this.pushMove(boardInfo, moves, row - 1, column + 2);
        this.pushMove(boardInfo, moves, row + 1, column - 2);
        this.pushMove(boardInfo, moves, row - 1, column - 2);

        return moves;
    }

    copy(): Piece {
        const config: PieceConfig = {
            color: this.color, row: this.row, column: this.column
        }
        return new Knight(config);
    }
}