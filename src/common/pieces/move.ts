export interface Move {
    row: number;
    column: number;
    type: 'move' | 'capture' | 'kingsideCastle' | 'queensideCastle';
}