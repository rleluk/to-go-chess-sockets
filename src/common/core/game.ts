import { Subscription, Subject } from 'rxjs';
import { Canvas } from '../interfaces/canvas';
import { Player } from '../interfaces/player';
import { BoardInfo } from './board-info';

export class Game {

	event: Subject<any> = new Subject<any>();

	private whitePlayer: Player;
	private blackPlayer: Player;

	private canvas: Canvas;

	private positionFEN: string;

	private boardInfo: BoardInfo;


	private whiteSubscription: Subscription;
	private blackSubscription: Subscription;

	private check: boolean;
	private mate: boolean;

	init(config: {canvas: Canvas, whitePlayer: Player, blackPlayer: Player, positionFEN?: string}) {
		this.canvas = config.canvas;
		this.whitePlayer = config.whitePlayer;
		this.blackPlayer = config.blackPlayer;
		this.boardInfo = new BoardInfo();

		this.positionFEN = config.positionFEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

		this.boardInfo.fromFEN(this.positionFEN);

		if (this.whiteSubscription) this.whiteSubscription.unsubscribe();
		if (this.blackSubscription) this.blackSubscription.unsubscribe();

		this.whiteSubscription = this.whitePlayer.emitMove.subscribe((move) => this.onMove(this.whitePlayer, move));
		this.whitePlayer.color = 'white';
		this.blackSubscription = this.blackPlayer.emitMove.subscribe((move) => this.onMove(this.blackPlayer, move));
		this.blackPlayer.color = 'black';


		this.canvas.draw(this.positionFEN);
	}


	private onMove(player: Player, move: string) {
		if (this.boardInfo.turn === player.color) {
			try {
				move = this.changePosition(move);
				this.positionFEN = this.boardInfo.toFEN();
				this.canvas.draw(this.positionFEN);

				if (player.color === 'white') {
					if (this.mate) {
						this.blackPlayer.receiveMove(move + '#');
						this.event.next({type: 'mate', data: 'white'});
					}
					else if (this.check) {
						this.blackPlayer.receiveMove(move + '+');
					}
					else {
						this.blackPlayer.receiveMove(move);
					}
				}
				else {
					if (this.mate) {
						this.whitePlayer.receiveMove(move + '#');
						this.event.next({type: 'mate', data: 'black'});
					}
					else if (this.check) {
						this.whitePlayer.receiveMove(move + '+');
					}
					else {
						this.whitePlayer.receiveMove(move);
					}
				}
			}
			catch(e) {
				console.warn(e.message);
			}
		}
	}

	private changeTurn() {
		if (this.boardInfo.turn === 'white') {
			this.boardInfo.turn = 'black';
		}
		else {
			this.boardInfo.turn = 'white';
		}
	}

	private changePosition (move: string): string {
		if (!move) throw new Error ('blank move');

		if (move === 'O-O' || move === 'O-O+' || move === 'O-O#') {
			const row = this.boardInfo.turn === 'white' ? 1 : 8;
			let king = this.boardInfo.find('k', this.boardInfo.turn).filter(piece => {
				return piece.checkMove(this.boardInfo, row, 7, 'kingsideCastle');
			});
			if (king[0]) {
				king[0].move(row, 7);
				this.boardInfo.moved(king[0], row, 5);
				const rook = this.boardInfo.get(row, 8);
				rook.move(row, 6);
				this.boardInfo.moved(rook, row, 8);

				this.clearCastling(this.boardInfo.turn);
				this.boardInfo.halfmoveClock++;
				this.finishMove();
				return move;
			}
			else {
				throw new Error ('invalid move');
			}
		}
		if (move === 'O-O-O' || move === 'O-O-O+' || move === 'O-O-O#') {
			const row = this.boardInfo.turn === 'white' ? 1 : 8;
			let king = this.boardInfo.find('k', this.boardInfo.turn).filter(piece => {
				return piece.checkMove(this.boardInfo, row, 3, 'queensideCastle');
			});
			if (king[0]) {
				king[0].move(row, 3);
				this.boardInfo.moved(king[0], row, 5);
				const rook = this.boardInfo.get(row, 1);
				rook.move(row, 4);
				this.boardInfo.moved(rook, row, 1);

				this.clearCastling(this.boardInfo.turn);
				this.boardInfo.halfmoveClock++;
				this.finishMove();
				return move;
			}
			else {
				throw new Error ('invalid move');
			}
		}

		let symbol: string;
		let offset = 0;
		let type: 'move' | 'capture' = 'move';
		let promotion = '';

		if(['R', 'N', 'B', 'Q', 'K'].includes(move[0])) {
			symbol = move[0].toLowerCase();
			offset = 1;
		}
		else {
			symbol = 'p';
		}

		let specifiedRow: number;
		let specifiedColumn: number;

		if(move[offset] !== 'x' && ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'x'].includes(move[offset + 1])) {
			if (Number(move[offset]) >= 1 && Number(move[offset]) <= 8) {
				specifiedRow = Number(move[offset]);
			}
			else {
				const specifiedLetter = move[offset].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
				if (specifiedLetter >= 1 && specifiedLetter <= 8) {
					specifiedColumn = specifiedLetter;
				}
				else {
					throw new Error ('invalid move');
				}
			}
			offset++;
		}
		else if(move[offset] !== 'x' && ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'x'].includes(move[offset + 2])) {
			specifiedColumn = move[offset].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
			specifiedRow = Number(move[offset + 1]);
			if (specifiedRow > 8 || specifiedRow < 1 || specifiedColumn > 8 || specifiedColumn < 1) {
				throw new Error('invalid move');
			}
			offset += 2;
		}

		if (move[offset] === 'x') {
			type = 'capture';
			offset++;
		}

		const destinationColumn = move[offset].charCodeAt(0) - 'a'.charCodeAt(0) + 1;
		offset++;
		const destinationRow = Number(move[offset]);
		offset++;


		if (symbol === 'p' && move[offset] === '=' && ['Q', 'R', 'N', 'B'].includes(move[offset + 1])) {
			promotion = this.boardInfo.turn === 'white' ? move[offset + 1] : move[offset + 1].toLowerCase();
			offset += 2;
		}

		if (symbol === 'p' && (destinationRow === 1 || destinationRow === 8) && !promotion) {
			throw new Error ('invalid move');
		}

		if (destinationRow < 1 || destinationRow > 8 || destinationColumn < 1 || destinationColumn > 8) {
			throw new Error ('invalid move');
		}

		move = move.slice(0, offset);

		let pieces = this.boardInfo.find(symbol, this.boardInfo.turn).filter(piece => {
			return piece.checkMove(this.boardInfo, destinationRow, destinationColumn, type);
		});
		pieces = pieces.filter(piece =>{
			if(specifiedRow && specifiedColumn) return piece.row === specifiedRow && piece.column === specifiedColumn;
			else if(specifiedRow) return piece.row === specifiedRow;
			else if(specifiedColumn) return piece.column === specifiedColumn;
			else return true;
		});
		if (pieces.length !== 1) {
			throw new Error ('invalid move');
		}
		let piece = pieces[0];
		const oldRow = piece.row;
		const oldColumn = piece.column;

		if (promotion) {
			piece = this.boardInfo.mapToPiece(promotion, destinationRow, destinationColumn);
		}

		piece.move(destinationRow, destinationColumn);
		this.boardInfo.moved(piece, oldRow, oldColumn);
		if (symbol === 'p' && type === 'capture'
			&& destinationColumn === this.boardInfo.enPassant.column && destinationRow === this.boardInfo.enPassant.row ) {
			this.boardInfo.capture(piece.color === 'white' ? 5 : 4, destinationColumn)
		}

		this.boardInfo.enPassant = {
			row: undefined,
			column: undefined,
		};
		if (symbol === 'p' && Math.abs(oldRow - destinationRow) === 2) {
			let enPassant = {
				column: destinationColumn,
				row: piece.color === 'white' ? 3 : 6
			};
			for (let j = destinationColumn - 1; j <= destinationColumn + 1; j += 2) {
				let checkPawn = this.boardInfo.get(destinationRow, j);
				if (checkPawn && checkPawn.color !== piece.color) {
					const boardInfoCopy = this.boardInfo.copy();
					const piece = checkPawn.copy();
					const pieceOldRow = piece.row;
					const pieceOldColumn = piece.column;
					piece.move(enPassant.row, enPassant.column);
					boardInfoCopy.moved(piece, pieceOldRow, pieceOldColumn);
					boardInfoCopy.capture(piece.color === 'white' ? 5 : 4, enPassant.column);
					const check = boardInfoCopy.isCheck();
					if ((checkPawn.color === 'white' && !check.white) || (checkPawn.color === 'black' && !check.black)) {
						this.boardInfo.enPassant = enPassant;
					}
				}
			}
		}

		if (symbol === 'k') {
			if (this.boardInfo.turn === 'white') {
				this.boardInfo.castlingAvailability.white = {kingside: false, queenside: false};
			}
			else {
				this.boardInfo.castlingAvailability.black = {kingside: false, queenside: false};
			}
		}
		if (symbol === 'r') {
			if (this.boardInfo.turn === 'white') {
				if (oldColumn === 8 && oldRow === 1) {
					this.boardInfo.castlingAvailability.white.kingside = false;
				}
				else if (oldColumn === 1 && oldRow === 1) {
					this.boardInfo.castlingAvailability.white.queenside = false;
				}
			}
			else {
				if (oldColumn === 8 && oldRow === 8) {
					this.boardInfo.castlingAvailability.black.kingside = false;
				}
				else if (oldColumn === 1 && oldRow === 8) {
					this.boardInfo.castlingAvailability.black.queenside = false;
				}
			}
		}

		if (symbol !== 'p' && type !== 'capture') {
			this.boardInfo.halfmoveClock++;
		}
		else {
			this.boardInfo.halfmoveClock = 0;
		}

		this.finishMove();
		return move;
	}

	finishMove(): void {
		this.check = false;
		this.mate = false;
		const check = this.boardInfo.isCheck();
		if (check.black || check.white) {
			this.check = true;
		}

		if (this.check) {
			this.mate = !this.boardInfo.hasMoves(this.boardInfo.turn === 'white' ? 'black' : 'white');
		}

		if (this.boardInfo.turn === 'black') {
			this.boardInfo.fullmoveNumber++;
		}

		this.changeTurn();
	}

	clearCastling(color: string) {
		if (color === 'white') {
			this.boardInfo.castlingAvailability.white = {kingside: false, queenside: false};
		}
		else {
			this.boardInfo.castlingAvailability.black = {kingside: false, queenside: false};
		}
	}

	getBoardInfo() {
		return this.boardInfo;
	}
}
