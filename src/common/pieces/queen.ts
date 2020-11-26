import { BoardInfo } from "../core/board-info";
import { Move } from "./move";
import { PieceConfig } from "./piece-config";
import { Piece } from "./piece";

export class Queen extends Piece {
    symbol = 'q';

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

        row = this.row + 1;
        column = this.column + 1;
        while (row <= 8 && column <=8 && this.pushMove(boardInfo, moves, row, column)) {
            row++;
            column++;
        }
        row = this.row - 1;
        column = this.column + 1;
        while (row >= 1 && column <=8 && this.pushMove(boardInfo, moves, row, column)) {
            row--;
            column++;
        }
        row = this.row + 1;
        column = this.column - 1;
        while (row <=8 && column >= 1 && this.pushMove(boardInfo, moves, row, column)) {
            row++;
            column--;
        }
        row = this.row - 1;
        column = this.column - 1;
        while (row >=1 && column >= 1 && this.pushMove(boardInfo, moves, row, column)) {
            row--;
            column--;
        }

        return moves;
    }

    copy(): Piece {
        const config: PieceConfig = {
            color: this.color, row: this.row, column: this.column
        }
        return new Queen(config);
    }
}