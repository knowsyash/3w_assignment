import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';


dotenv.config();

const preferredPort = Number(process.env.PORT || 5001);
const mongoUri = process.env.MONGO_URI;
const maxPortRetries = 5;

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
    try {
        await connectDB(mongoUri);

        const { port } = await listenWithRetry(preferredPort);
        console.log(`[SERVER] Listening on port ${port}`);
    } catch (error) {
        console.error(`[SERVER] Error: ${error.message}`);
        process.exit(1);
    }
}

startServer();
