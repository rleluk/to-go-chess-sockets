import Mode from './mode';

export default interface ChessClockConfig {
    initMsBlack: number;
    initMsWhite: number;
    stepWhite: number;
    stepBlack: number;
    mode: Mode;
    endCallback: (winner: string) => void;
}