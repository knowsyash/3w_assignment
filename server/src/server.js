import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';


dotenv.config();

const preferredPort = Number(process.env.PORT || 5001);
const mongoUri = process.env.MONGO_URI;
const maxPortRetries = 5;
const dbRetryMs = 30000;

let dbConnected = false;

function listenWithRetry(startPort) {
    return new Promise((resolve, reject) => {
        const firstPort = Number.isFinite(startPort) ? startPort : 5001;

        function tryPort(port, retriesLeft) {
            const server = app.listen(port);

            server.once('listening', () => {
                resolve({ server, port });
            });

            server.once('error', (error) => {
                if (error.code === 'EADDRINUSE' && retriesLeft > 0) {
                    const nextPort = port + 1;
                    console.warn(`Port ${port} is in use. Retrying on port ${nextPort}.`);
                    tryPort(nextPort, retriesLeft - 1);
                    return;
                }

                reject(error);
            });
        }

        tryPort(firstPort, maxPortRetries);
    });
}

async function startServer() {
    async function tryConnectDB() {
        if (dbConnected) {
            return;
        }

        try {
            await connectDB(mongoUri);
            dbConnected = true;
            console.log('[DB] Connected successfully.');
        } catch (error) {
            console.warn(`[DB] Connection unavailable: ${error.message}`);
        }
    }

    try {
        const { port } = await listenWithRetry(preferredPort);
        console.log(`[SERVER] Listening on port ${port}`);

        await tryConnectDB();

        if (!dbConnected) {
            console.warn(`[DB] Running without database for now. Retrying every ${dbRetryMs / 1000}s.`);
            setInterval(() => {
                void tryConnectDB();
            }, dbRetryMs);
        }
    } catch (error) {
        console.error(`[SERVER] Error: ${error.message}`);
        process.exit(1);
    }
}

startServer();
