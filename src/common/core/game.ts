import { Subscription, Subject } from 'rxjs';
import { Canvas } from '../interfaces/canvas';
import { Player } from '../interfaces/player';
import { BoardInfo } from './board-info';
import GameTree from '../game_tree/game-tree';
import ChessClock from "../timer/chess-clock";
import ChessClockConfig from "../timer/chess-clock-config";

class MockClock {
    startCountdown = () => {}
    switchClock = () => {}
    stopCountdown = () => {}
    getTimes = () => {}
};

export class Game {
	
	event: Subject<any> = new Subject<any>();
	
	whitePlayer: Player;
	blackPlayer: Player;
	
	private gameTree: GameTree;
	private canvas: Canvas;
	
	private positionFEN: string;
	private boardInfo: BoardInfo;

	private chessClock: any;

	private whiteSubscription: Subscription;
	private blackSubscription: Subscription;

	private check: boolean;
	private mate: boolean;
	private draw: boolean;
	private drawOffer: boolean;
	private drawOfferColor: string;

	private STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

	init(config: {canvas: Canvas, whitePlayer: Player, blackPlayer: Player, chessClockConfig: ChessClockConfig, positionFEN?: string}) {
		this.canvas = config.canvas;
		this.whitePlayer = config.whitePlayer;
		this.blackPlayer = config.blackPlayer;
		this.boardInfo = new BoardInfo();
		this.gameTree = new GameTree(this.STARTING_FEN);
		this.chessClock = config.chessClockConfig ? new ChessClock(config.chessClockConfig): new MockClock();
		this.draw = false;
		this.drawOffer = false;
		this.drawOfferColor = '';

		this.positionFEN = config.positionFEN || this.STARTING_FEN;

		this.boardInfo.fromFEN(this.positionFEN);

		if (this.whiteSubscription) this.whiteSubscription.unsubscribe();
		if (this.blackSubscription) this.blackSubscription.unsubscribe();

		this.whiteSubscription = this.whitePlayer.emitMove.subscribe((move) => this.onMove(this.whitePlayer, move));
		this.whitePlayer.color = 'white';
		this.blackSubscription = this.blackPlayer.emitMove.subscribe((move) => this.onMove(this.blackPlayer, move));
		this.blackPlayer.color = 'black';


		this.canvas.draw(this.positionFEN);
		this.chessClock.startCountdown();
	}

	private onMove(player: Player, move: string) {
		if (move === 'draw') {
			if (this.drawOffer && this.drawOfferColor !== player.color) {
				this.draw = true;
				this.event.next({type: 'draw', data: ''});
				if (player.color === 'white') {
					this.blackPlayer.receiveMove('draw');
				}
				else {
					this.whitePlayer.receiveMove('draw');
				}
			}
			else if (!this.drawOffer) {
				this.drawOffer = true;
				if (player.color === 'white') {
					this.drawOfferColor = 'white';
					this.blackPlayer.receiveMove('draw');
					this.event.next({type: 'draw_offer', data: 'white'});
				} else {
					this.drawOfferColor = 'black';
					this.whitePlayer.receiveMove('draw');
					this.event.next({type: 'draw_offer', data: 'black'});
				}
			}
		} else if (move === 'surrender') {
			if (player.color === 'white') {
				this.blackPlayer.receiveMove(move);
				this.event.next({type: 'surrender', data: 'white'});
			}
			else {
				this.whitePlayer.receiveMove(move);
				this.event.next({type: 'surrender', data: 'black'});
			}
		}
		else if (this.boardInfo.turn === player.color) {
			try {
				move = this.changePosition(move);
				this.positionFEN = this.boardInfo.toFEN();
				this.gameTree.addMove(move, this.positionFEN);
				this.canvas.draw(this.positionFEN);
				this.chessClock.switchClock();
				this.drawOffer = false;
				this.drawOfferColor = '';

				if (player.color === 'white') {
					if (this.mate) {
						this.blackPlayer.receiveMove(move + '#');
						this.event.next({type: 'mate', data: 'white'});
						this.chessClock.stopCountdown();
					}
					else if (this.draw) {
						this.blackPlayer.receiveMove(move);
						this.blackPlayer.receiveMove('draw');
						this.event.next({type: 'draw', data: ''});
						this.chessClock.stopCountdown();
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
						this.chessClock.stopCountdown();
					}
					else if (this.draw) {
						this.whitePlayer.receiveMove(move);
						this.whitePlayer.receiveMove('draw');
						this.event.next({type: 'draw', data: ''});
						this.chessClock.stopCountdown();
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
				if (this.boardInfo.halfmoveClock >= 100) {
					this.draw = true;
				}
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
				if (this.boardInfo.halfmoveClock >= 100) {
					this.draw = true;
				}
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

		if (type === 'capture' && !this.boardInfo.hasMateMaterial()) {
			this.draw = true;
		}

		if (symbol !== 'p' && type !== 'capture') {
			this.boardInfo.halfmoveClock++;
			if (this.boardInfo.halfmoveClock >= 100) {
				this.draw = true;
			}
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
		else if (!this.boardInfo.hasMoves(this.boardInfo.turn === 'white' ? 'black' : 'white')) {
			this.draw = true;
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

	update(positionFEN: string) {
		this.positionFEN = positionFEN;
		this.boardInfo.fromFEN(positionFEN);
		this.canvas.draw(positionFEN);
	}

	getTimes() {
		return this.chessClock.getTimes();
	}

	getBoardInfo() {
		return this.boardInfo;
	}

	getChessboard() {
		return this.canvas;
	}

	stopClock() {
		this.chessClock.stopCountdown();
	}

	getTurn() {
		return this.boardInfo.turn;
	}
	
	getTree() {
		return this.gameTree;
	}

	isDraw() {
		return this.draw ? true : false;
	}
}
