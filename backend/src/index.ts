import './env'; // Ensure env vars are loaded first
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { createContext } from './context';

const PORT = process.env.PORT || 4000;

async function startServer() {
    const app = express();
    const httpServer = http.createServer(app);

    // Create Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    // Start Apollo Server
    await server.start();

    // Apply middleware
    app.use(
        '/graphql',
        cors<cors.CorsRequest>({
            origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
            credentials: true,
        }),
        express.json(),
        expressMiddleware(server, {
            context: createContext,
        })
    );

    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    // Explicitly bind to 0.0.0.0 to allow external access in cloud environments
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT, host: '0.0.0.0' }, resolve));

    console.log(`🚀 Server ready on 0.0.0.0:${PORT}/graphql`);
    console.log(`🏥 Health check at http://0.0.0.0:${PORT}/health`);
}

startServer().catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1);
});
