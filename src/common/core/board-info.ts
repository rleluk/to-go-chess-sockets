import { Bishop } from "../pieces/bishop";
import { King } from "../pieces/king";
import { Knight } from "../pieces/knight";
import { Pawn } from "../pieces/pawn";
import { Piece } from "../pieces/piece";
import { PieceConfig } from "../pieces/piece-config";
import { Queen } from "../pieces/queen";
import { Rook } from "../pieces/rook";

export class BoardInfo {
    private board: Piece[][] = [];

    enPassant: {
        row: number;
        column: number;
    }

    castlingAvailability = {
		white: {kingside: true, queenside: true},
		black: {kingside: true, queenside: true}
    }
    
    allowCheck: boolean;

    halfmoveClock: number = 0;
    fullmoveNumber: number = 0;
    turn: 'white' | 'black';

    constructor() {
        this.init();
    }

    init(): void {
        for (let row = 0; row < 8; row++) {
            this.board[row] = new Array(8);
        }
        this.enPassant = {
            row: undefined,
            column: undefined,  
        }
        this.allowCheck = false;
    }

    set(piece: Piece): void {
        this.board[piece.row - 1][piece.column - 1] = piece;
    }

    get(row: number, column: number): Piece {
        return this.board[row - 1][column - 1];
    }

    find(symbol: string, color: 'white' | 'black'): Piece[] {
        let pieces: Piece[] = [];
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column++) {
                const piece = this.board[row][column];
                if (piece && piece.color === color && piece.symbol === symbol) {
                    pieces.push(this.board[row][column]);
                }
            }
        }
        return pieces;
    }

    moved(piece: Piece, oldRow: number, oldColumn: number) {
        this.board[oldRow - 1][oldColumn - 1] = undefined;
        this.board[piece.row - 1][piece.column - 1] = piece;     
    }

    capture(row: number, column: number) {
        this.board[row - 1][column - 1] = undefined; 
    }

    copy(): BoardInfo {
        const boardInfo = new BoardInfo();

        for (let row = 1; row <= 8; row++) {
            for (let column = 1; column <= 8; column++) {
                const piece = this.get(row, column);
                if (piece) {
                    boardInfo.set(piece.copy());
                }
            }
        }

        boardInfo.enPassant.row = this.enPassant.row;
        boardInfo.enPassant.column = this.enPassant.column;

        boardInfo.castlingAvailability.white = {...this.castlingAvailability.white};
        boardInfo.castlingAvailability.black = {...this.castlingAvailability.black};


        return boardInfo;
    }

    isCheck(): {white: boolean, black: boolean} {
        let white = false;
        let black = false;
        const whiteKing = this.find('k', 'white')[0];
        const blackKing = this.find('k', 'black')[0];
        if (!whiteKing || !blackKing) {
            throw new Error('There is no king');
        }
        this.allowCheck = true;
        for (let row = 1; row <=8; row++) {
            for (let column = 1; column <=8; column++) {
                const piece = this.get(row, column);
                if (piece && piece.color === 'white') {
                    if (piece.checkMove(this, blackKing.row, blackKing.column, 'capture')) {
                        black = true;
                    }
                }
                else if (piece && piece.color === 'black') {
                    if (piece.checkMove(this, whiteKing.row, whiteKing.column, 'capture')) {
                        white = true;
                    }
                }
            }
        }
        this.allowCheck = false;
        return {white, black};
    }

    hasMoves(color: string): boolean {
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column++) {
                const piece = this.board[row][column];
                if (piece && piece.color === color && piece.possibleMoves(this).length) {
                    return true;
                }
            }
        }
        return false;
    }

    hasMateMaterial(color?: string): boolean {
        let light = false;
        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column++) {
                const piece = this.board[row][column];
                if (piece && (!color || piece.color === color)) {
                    if (piece.symbol === 'b' || piece.symbol === 'n') {
                        if (light) return true;
                        else light = true;
                    }
                    else if (piece.symbol !== 'k') {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    fromFEN(positionFEN: string) {
        this.init();
        let column = 1;
        let row = 8;
        let i: number;
    
        for(i = 0; positionFEN[i] !== ' '; i++) {
            if(positionFEN[i] === '/') {
                row--;
                column = 1;
                continue;
            }
            const number = Number(positionFEN[i]);
            if (isNaN(number)) {
                this.set(this.mapToPiece(positionFEN[i], row, column));
                column++;
            }
            else {
                column += number;
            }
        }
        
        i++;
        this.turn = positionFEN[i] === 'w' ? 'white' : 'black';
        
        i+=2;
        const endCastlingIndex = positionFEN.indexOf(' ', i);
        const castlingFEN = positionFEN.substring(i, endCastlingIndex);
        this.castlingAvailability = {
            white: {kingside: false, queenside: false},
            black: {kingside: false, queenside: false}
        }
        if(castlingFEN !== '-') {
            while (positionFEN[i] !== ' ') {
                switch (positionFEN[i]) {
                    case 'K':
                        this.castlingAvailability.white.kingside = true;
                        break;
                    case 'Q':
                        this.castlingAvailability.white.queenside = true;
                        break;
                    case 'k':
                        this.castlingAvailability.black.kingside = true;
                        break;
                    case 'q':
                        this.castlingAvailability.black.queenside = true;
                        break;
                }
                i++;
            }
            i--;
        }
        i+=2;
        if (positionFEN[i] !== '-') {
			const column = positionFEN[i].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
			i++;
			const row = Number(positionFEN[i])
			this.enPassant = {row, column};
		}
        i+=2;
        const endHalfmoveIndex = positionFEN.indexOf(' ', i);
        const halfmoveFEN = positionFEN.substring(i, endHalfmoveIndex);
        this.halfmoveClock = Number(halfmoveFEN);
        i = endHalfmoveIndex + 1;
        
        const fullmoveFEN = positionFEN.substring(i);
        this.fullmoveNumber= Number(fullmoveFEN);
        return this;
    }

    public toFEN() {
		let FEN = '';
		for (let row = 8; row > 0; row--) {
			let blank = 0;
			for (let column = 1; column <= 8; column++) {
				let piece = this.get(row, column);
				if (piece) {
					if (blank) {
						FEN += blank;
					}
					FEN += piece.color === 'white' ?
						piece.getSymbol().toUpperCase() : piece.getSymbol().toLowerCase();
					blank = 0;
				}
				else {
					blank++;
				}
			}
			if (blank) {
				FEN += blank;
			}
			if (row > 1) {
				FEN += '/'
			}
        }
        
        let castlingAvailability = '';
		castlingAvailability += this.castlingAvailability.white.kingside ? 'K' : '';
		castlingAvailability += this.castlingAvailability.white.queenside ? 'Q' : '';
		castlingAvailability += this.castlingAvailability.black.kingside ? 'k' : '';
		castlingAvailability += this.castlingAvailability.black.queenside ? 'q' : '';

		if (!castlingAvailability) {
			castlingAvailability = '-'
		}

		let enPassant: string;
		if (!this.enPassant.row || !this.enPassant.column) {
			enPassant = '-';
		}
		else {
			enPassant = String.fromCharCode('a'.charCodeAt(0) + this.enPassant.column - 1)
				+ this.enPassant.row;
		}

		return FEN + ' ' 
            + (this.turn === 'white' ? 'w' : 'b') + ' '
            + castlingAvailability + ' '
            + enPassant + ' '
            + this.halfmoveClock + ' '
            + this.fullmoveNumber;
	}

    mapToPiece(letter: string, row: number, column: number) {
		const color = letter.toUpperCase() === letter ? 'white' : 'black';
		const config: PieceConfig = {
			color, row, column
		}
		switch (letter.toLowerCase()) {
			case 'r':
				return new Rook(config);
			case 'n':
				return new Knight(config);
			case 'b':
				return new Bishop(config);
			case 'q':
				return new Queen(config);
			case 'k':
				return new King(config);
			default:
				return new Pawn(config);
		}
	}

}