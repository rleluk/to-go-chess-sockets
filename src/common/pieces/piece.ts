import { BoardInfo } from "../core/board-info";
import { Move } from "./move";
import { PieceConfig } from "./piece-config";

export abstract class Piece {
    color: 'white' | 'black';
    row: number;
    column: number;
    abstract symbol: string;

    constructor(config: PieceConfig) {
        this.color = config.color;
        this.row = config.row;
        this.column = config.column;
    }

    getSymbol(): string {
        return this.symbol;
    }

    move(row: number, column: number): void {
        this.row = row;
        this.column = column;
    }

    possibleMoves(boardInfo: BoardInfo): Move[] {
        return [];
    }

    checkMove(boardInfo: BoardInfo, row: number, column: number, type: 'move' | 'capture' | 'kingsideCastle' | 'queensideCastle'): boolean {
        return this.possibleMoves(boardInfo).findIndex(move => {
            return move.row === row && move.column === column && move.type === type
        }) >= 0;
    }

    abstract copy(): Piece;

    protected pushMove(boardInfo: BoardInfo, moves: Move[], row: number, column: number, type?: 'move' | 'capture'): boolean {
        if (row >= 1 && row <=8 && column >=1 && column <= 8) {
            let mode: string;
            let piece = boardInfo.get(row, column);
            if (piece && piece.color != this.color && type !== 'move') {
                mode = 'capture';
                
            } else if (!piece && type !== 'capture') {
                mode = 'move';   
            }

            if (!boardInfo.allowCheck && mode) {
                const boardInfoCopy = boardInfo.copy();
                const piece = boardInfoCopy.get(this.row, this.column);
                piece.move(row, column)
                boardInfoCopy.moved(piece, this.row, this.column);
                const check = boardInfoCopy.isCheck();
                if ((check.white && this.color === 'white') || (check.black && this.color === 'black')) {
                    if (mode === 'capture') {
                        return false;
                    }
                    else if (mode === 'move') {
                        return true;
                    }
                }
            }
            if (mode === 'capture') {
                moves.push({row, column, type: 'capture'});
                return false;
            }
            else if (mode === 'move') {
                moves.push({row, column, type: 'move'});
                return true;
            }
        }
        return false;
    }

}