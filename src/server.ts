import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import WaitingRoom from './waiting-room';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const wr = new WaitingRoom(wss);

server.listen(process.env.PORT || 9000, () => {
    console.log(`Server has started.`);
});