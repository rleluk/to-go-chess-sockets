import { BoardInfo } from "../core/board-info";
import { Move } from "./move";
import { PieceConfig } from "./piece-config";
import { Piece } from "./piece";

export class Rook extends Piece {
    symbol = 'r';

    possibleMoves(boardInfo: BoardInfo): Move[] {
        let moves: Move[] = [];
        let row = this.row + 1;
        let column = this.column;
        while (row <= 8 && this.pushMove(boardInfo, moves, row, column)) {
            row++;
        }
        row = this.row - 1;
        column = this.column;
        while (row >= 1 && this.pushMove(boardInfo, moves, row, column)) {
            row--;
        }
        row = this.row;
        column = this.column + 1;
        while (column <=8 && this.pushMove(boardInfo, moves, row, column)) {
            column++;
        }
        row = this.row;
        column = this.column - 1;
        while (column >= 1 && this.pushMove(boardInfo, moves, row, column)) {
            column--;
        }
        return moves;
    }

    copy(): Piece {
        const config: PieceConfig = {
            color: this.color, row: this.row, column: this.column
        }
        return new Rook(config);
    }
}