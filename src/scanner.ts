import * as net from 'net';
import PortStatus from './PortStatus';
const _cliProgress = require('cli-progress');

type Nullable<T> = T | undefined | null;

export const checkPortRange = async (host: string, startPort: number, endPort: number) => {
    
    // const bar1 = new _cliProgress.SingleBar({}, _cliProgress.Presets.shades_classic);
    const bar1 = new _cliProgress.SingleBar({
        format: '{bar} | {percentage}% | {value}/{total} Ports Scanned | Open Ports: {openPorts}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    let openPortCount = 0;
    bar1.start(endPort - startPort, 0, {
        openPorts: openPortCount.toString()
    });

    const toReturn = [];

    for (let i = startPort; i <= endPort; i++) {

        const result = await checkPort(host, i);

        toReturn.push({
            port: i,
            status: result
        })

        if (result === PortStatus.Open) {
            openPortCount++;
        }


        bar1.update(i - startPort, { openPorts: openPortCount.toString() });
    }

    let openPorts = toReturn.filter(event => {
        event.status == 1;
    })

    console.log(JSON.stringify(openPorts));
    bar1.stop();
};

export const checkPort = async (host: string, port: number): Promise<PortStatus> => {
    if (port < 0 || port > 65535) {
        throw "Invalid port";
    }

    return new Promise<PortStatus>((resolve, reject) => {
        var status: PortStatus = PortStatus.NotSet;
        var connectionRefused = false;
        var error: Nullable<Error> = null;

        const socket = new net.Socket();

        const timeout = 3000;

        socket.setTimeout(timeout);

        socket.on('connect', () => {
            status = PortStatus.Open;

            socket.destroy();
        });

        socket.on('timeout', () => {
            status = PortStatus.Closed;
            error = new Error('Timeout (' + timeout + 'ms) occurred waiting for ' + host + ':' + port + ' to be available');
            socket.destroy();
        });

        socket.on('error', (e: NodeJS.ErrnoException) => {
            if (e.code !== 'ECONNREFUSED') {
                error = e;
            } else {
                connectionRefused = true;
            }

            status = PortStatus.Closed
        });

        socket.on('close', (e: NodeJS.ErrnoException) => {
            if (e && !connectionRefused) {
                error = error || e;
            } else {
                error = null;
            }

            resolve(status);
        });

        socket.connect(port, host);
    });
}