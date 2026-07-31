class NetworkManager {
    constructor() {
        this.peer = null;
        this.connections = [];
        this.isHost = false;
        this.roomCode = "";
        this.remotePlayers = {};
    }

    initHost(onReady) {
        this.isHost = true;
        this.roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.peer = new Peer(`RIVALS-${this.roomCode}`);

        this.peer.on('open', () => {
            onReady(this.roomCode);
        });

        this.peer.on('connection', (conn) => {
            this.connections.push(conn);
            this.setupConnectionListeners(conn);
        });
    }

    joinRoom(code, onJoined) {
        this.isHost = false;
        this.roomCode = code.toUpperCase();
        this.peer = new Peer();

        this.peer.on('open', () => {
            const conn = this.peer.connect(`RIVALS-${this.roomCode}`);
            this.connections.push(conn);
            this.setupConnectionListeners(conn);
            onJoined();
        });
    }

    setupConnectionListeners(conn) {
        conn.on('data', (data) => {
            if (this.onDataReceived) this.onDataReceived(data, conn.peer);
        });
    }

    broadcast(data) {
        this.connections.forEach(conn => conn.send(data));
    }
}

const network = new NetworkManager();