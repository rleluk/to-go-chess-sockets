import { BoardInfo } from "../core/board-info";
import { Move } from "./move";
import { PieceConfig } from "./piece-config";
import { Piece } from "./piece";

export class Pawn extends Piece {
    symbol = 'p';

    possibleMoves(boardInfo: BoardInfo): Move[] {
        let moves: Move[] = [];

        if (this.color === 'white') {
            if (this.pushMove(boardInfo, moves, this.row + 1, this.column, 'move') && this.row === 2) {
                this.pushMove(boardInfo, moves, this.row + 2, this.column, 'move');
            }
            this.pushMove(boardInfo, moves, this.row + 1, this.column + 1, 'capture');
            this.pushMove(boardInfo, moves, this.row + 1, this.column - 1, 'capture');
        }
        else {
            if (this.pushMove(boardInfo, moves, this.row - 1, this.column, 'move') && this.row === 7) {
                this.pushMove(boardInfo, moves, this.row - 2, this.column, 'move');
            }
            this.pushMove(boardInfo, moves, this.row - 1, this.column + 1, 'capture');
            this.pushMove(boardInfo, moves, this.row - 1, this.column - 1, 'capture');
        }

        if (boardInfo.enPassant.row && boardInfo.enPassant.column) {
            if (Math.abs(boardInfo.enPassant.column - this.column) === 1) {
                if (this.color === 'white' && this.row === 5) {
                    const boardInfoCopy = boardInfo.copy();
                    const piece = boardInfoCopy.get(this.row, this.column);
                    piece.move(6, boardInfo.enPassant.column)
                    boardInfoCopy.moved(piece, this.row, this.column);
                    boardInfoCopy.capture(5, boardInfo.enPassant.column);
                    const check = boardInfoCopy.isCheck();
                    if (!check.white) {
                        moves.push({row: 6, column: boardInfo.enPassant.column, type: 'capture'});
                    }
                }
                else if (this.color === 'black' && this.row === 4) {
                    const boardInfoCopy = boardInfo.copy();
                    const piece = boardInfoCopy.get(this.row, this.column);
                    piece.move(3, boardInfo.enPassant.column)
                    boardInfoCopy.moved(piece, this.row, this.column);
                    boardInfoCopy.capture(3, boardInfo.enPassant.column);
                    const check = boardInfoCopy.isCheck();
                    if (!check.black) {
                        moves.push({row: 3, column: boardInfo.enPassant.column, type: 'capture'});
                    }
                }
            }
        }

        return moves;
    }

    copy(): Piece {
        const config: PieceConfig = {
            color: this.color, row: this.row, column: this.column
        }
        return new Pawn(config);
    }

}