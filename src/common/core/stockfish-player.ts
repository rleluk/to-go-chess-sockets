import { Subject } from "rxjs";
import { BoardInfo } from "./board-info";
import { Player } from "../interfaces/player";
var stockfish = require("stockfish");

export class StockfishPlayer implements Player {
    color: 'white' | 'black';
    emitMove: Subject<string> = new Subject<string>();
    stockfish: any;
    boardInfo: BoardInfo;
    depth: number;
    re = RegExp(/bestmove (\w+)/);

    constructor(depth: number) {
        this.depth = depth;
        this.stockfish = stockfish();

        this.stockfish.onmessage = (message) => {
            let stockfishMove = message.match(this.re);
            if (stockfishMove) {
                let parsedMove = parseToPGN(this.boardInfo, stockfishMove[1]);
                if (parsedMove) {
                    this.move(parsedMove);
                }
            }
        };
    }

    setBoardInfo(boardInfo: BoardInfo) {
        this.boardInfo = boardInfo;
    }

    move(move: string) {
        this.emitMove.next(move);
    }

    receiveMove(move: string) {
        this.makeBestMove();
    }

    makeFirstMove() {
        this.makeBestMove();
    }

    private makeBestMove() {
        this.stockfish.postMessage('ucinewgame');
        this.stockfish.postMessage(`position fen ${this.boardInfo.toFEN()}`)
        this.stockfish.postMessage(`go depth ${this.depth}`);
    }
}

const getIndex = (col) => {
    switch(col) {
        case 'a':
            return 1;
        case 'b':
            return 2;
        case 'c':
            return 3;
        case 'd':
            return 4;
        case 'e':
            return 5;
        case 'f':
            return 6;
        case 'g':
            return 7;
        case 'h':
            return 8;
    }
}

const parseToPGN = (boardInfo: BoardInfo, secondPieceParse: string) => {
    let firstPiece = boardInfo.get(parseInt(secondPieceParse[1]), getIndex(secondPieceParse[0]));
    if (!firstPiece) return null;

    let secondPiece = {
        column: getIndex(secondPieceParse[2]),
        row: parseInt(secondPieceParse[3]),
    }

    let move = firstPiece.possibleMoves(boardInfo).filter(piece => piece.row === secondPiece.row && piece.column === secondPiece.column)[0];
    if (move === undefined) {
        throw new Error('invalid move');
    };

    let movePGN: string = '';
    if (firstPiece.symbol === 'p') {
        if (move.type === 'capture') movePGN += 'abcdefgh'[firstPiece.column - 1] + 'x';
        movePGN += 'abcdefgh'[secondPiece.column - 1] + secondPiece.row;
        if (secondPiece.row === 8 && boardInfo.turn === 'white' || secondPiece.row === 1 && boardInfo.turn === 'black') {
            movePGN += '=' + secondPieceParse[4].toUpperCase();
            return;
        }
    } else if (firstPiece.symbol === 'k' && move.type === 'kingsideCastle') {
        movePGN += 'O-O';
    } else if (firstPiece.symbol === 'k' && move.type === 'queensideCastle') {
        movePGN += 'O-O-O';
    } else {
        movePGN += firstPiece.symbol.toUpperCase();
        let samePieces = boardInfo.find(firstPiece.symbol, boardInfo.turn).filter(piece => {
            return piece.checkMove(boardInfo, secondPiece.row, secondPiece.column, move.type);
        });
        let toAdd = '';
        samePieces = samePieces.filter(piece => !(piece.column === firstPiece.column && piece.row === firstPiece.row));
        if (samePieces.some(piece => piece.row === firstPiece.row)) {
            toAdd += 'abcdefgh'[firstPiece.column - 1];
        }
        if (samePieces.some(piece => piece.column === firstPiece.column)) {
            toAdd += firstPiece.row;
        }
        if (toAdd.length === 0 && samePieces.length !== 0) {
            toAdd += 'abcdefgh'[firstPiece.column - 1];
        }
        if (move.type === 'capture') toAdd += 'x';
        movePGN += toAdd;
        movePGN += 'abcdefgh'[secondPiece.column - 1] + secondPiece.row;
    }

    return movePGN;
}
