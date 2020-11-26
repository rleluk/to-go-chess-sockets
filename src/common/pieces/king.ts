import { BoardInfo } from "../core/board-info";
import { Move } from "./move";
import { PieceConfig } from "./piece-config";
import { Piece } from "./piece";

export class King extends Piece {
    symbol = 'k';

    possibleMoves(boardInfo: BoardInfo): Move[] {
        let moves: Move[] = [];
        let row = this.row + 1;
        let column = this.column;
        this.pushMove(boardInfo, moves, row, column);

        row = this.row - 1;
        column = this.column;
        this.pushMove(boardInfo, moves, row, column);
        
        row = this.row;
        column = this.column + 1;
        this.pushMove(boardInfo, moves, row, column);
        
        row = this.row;
        column = this.column - 1;
        this.pushMove(boardInfo, moves, row, column);

        row = this.row + 1;
        column = this.column + 1;
        this.pushMove(boardInfo, moves, row, column);
        
        row = this.row - 1;
        column = this.column + 1;
        this.pushMove(boardInfo, moves, row, column);
        
        row = this.row + 1;
        column = this.column - 1;
        this.pushMove(boardInfo, moves, row, column);

        row = this.row - 1;
        column = this.column - 1;
        this.pushMove(boardInfo, moves, row, column);

        if (this.color === 'white' && !boardInfo.allowCheck) {
            if (boardInfo.castlingAvailability.white.kingside) {
                let flag = true;
                for (let col = 6; col <= 7; col++) {
                    if (boardInfo.get(1, col)) {
                        flag = false;
                    }
                }
                if (flag) {
                    const boardInfoCopy = boardInfo.copy();
                    const king = this.copy();
                    king.move(1, 6);
                    boardInfoCopy.moved(king, 1, 5);
                    let check = boardInfoCopy.isCheck();
                    if (!check.white) {
                        king.move(1, 7);
                        boardInfoCopy.moved(king, 1, 6);
                        let check = boardInfoCopy.isCheck();
                        if (!check.white) {
                            moves.push({row: 1, column: 7, type: 'kingsideCastle'});
                        }
                    }
                }
            }
            if (boardInfo.castlingAvailability.white.queenside) {
                let flag = true;
                for (let col = 4; col >= 3; col--) {
                    if (boardInfo.get(1, col)) {
                        flag = false;
                    }
                }
                if (flag) {
                    const boardInfoCopy = boardInfo.copy();
                    const king = this.copy();
                    king.move(1, 4);
                    boardInfoCopy.moved(king, 1, 5);
                    let check = boardInfoCopy.isCheck();
                    if (!check.white) {
                        king.move(1, 3);
                        boardInfoCopy.moved(king, 1, 4);
                        let check = boardInfoCopy.isCheck();
                        if (!check.white) {
                            moves.push({row: 1, column: 3, type: 'queensideCastle'});
                        }
                    }
                }
            }
        }
        else if (this.color === 'black' && !boardInfo.allowCheck) {
            if (boardInfo.castlingAvailability.black.kingside) {
                let flag = true;
                for (let col = 6; col <= 7; col++) {
                    if (boardInfo.get(8, col)) {
                        flag = false;
                    }
                }
                if (flag) {
                    const boardInfoCopy = boardInfo.copy();
                    const king = this.copy();
                    king.move(8, 6);
                    boardInfoCopy.moved(king, 8, 5);
                    let check = boardInfoCopy.isCheck();
                    if (!check.black) {
                        king.move(8, 7);
                        boardInfoCopy.moved(king, 8, 6);
                        let check = boardInfoCopy.isCheck();
                        if (!check.black) {
                            moves.push({row: 8, column: 7, type: 'kingsideCastle'});
                        }
                    }
                }
            }
            if (boardInfo.castlingAvailability.black.queenside) {
                let flag = true;
                for (let col = 4; col >= 3; col--) {
                    if (boardInfo.get(8, col)) {
                        flag = false;
                    }
                }
                if (flag) {
                    const boardInfoCopy = boardInfo.copy();
                    const king = this.copy();
                    king.move(8, 4);
                    boardInfoCopy.moved(king, 8, 5);
                    let check = boardInfoCopy.isCheck();
                    if (!check.black) {
                        king.move(8, 3);
                        boardInfoCopy.moved(king, 1, 4);
                        let check = boardInfoCopy.isCheck();
                        if (!check.black) {
                            moves.push({row: 8, column: 3, type: 'queensideCastle'});
                        }
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
        return new King(config);
    }

}