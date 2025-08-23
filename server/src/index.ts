
import express from 'express';
import { createHandler } from 'graphql-http';
import mongoose from 'mongoose';
import cors from 'cors';
import { schema } from './graphql/schema';
import { root } from './graphql/resolvers';
import dotenv from 'dotenv';

dotenv.config();

const startServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 4000;

    const corsOptions = {
        origin: '*', // Allow all origins
        methods: ['POST', 'GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };
    
    // Middleware
    // Handle pre-flight requests across all routes
    app.options('*', cors(corsOptions));
    app.use(cors(corsOptions));

    // GraphQL Endpoint
    app.all('/graphql', createHandler({
        schema: schema,
        rootValue: root,
    }));
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('MONGO_URI not found in environment variables. Please set it in a .env file.');
        (process as any).exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Successfully connected to MongoDB.');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}/graphql`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        (process as any).exit(1);
    }
};

startServer();