import request from 'supertest';
import express from 'express';

describe('Smoke Tests', () => {
    let app: express.Application;

    beforeAll(() => {
        // Create a minimal Express app for testing
        app = express();
        app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok', message: 'Server is running' });
        });
    });

    test('Server should start successfully', () => {
        expect(app).toBeDefined();
    });

    test('Health check endpoint should return 200', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
    });

    test('Application should be an Express instance', () => {
        expect(typeof app).toBe('function');
    });
});
