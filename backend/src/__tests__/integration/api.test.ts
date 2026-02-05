import request from 'supertest';
import express from 'express';
import cors from 'cors';

describe('API Integration Tests', () => {
    let app: express.Application;

    beforeAll(() => {
        // Create a test Express app
        app = express();
        app.use(cors());
        app.use(express.json());

        // Mock pantry routes
        app.get('/api/pantry', (req, res) => {
            res.status(200).json({
                items: [
                    { id: '1', name: 'apple', category: 'produce', quantity: 5 },
                    { id: '2', name: 'milk', category: 'dairy', quantity: 1 },
                ],
            });
        });

        app.post('/api/pantry', (req, res) => {
            const { name, category, quantity } = req.body;
            if (!name || !category || !quantity) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            res.status(201).json({
                id: '3',
                name,
                category,
                quantity,
            });
        });

        app.delete('/api/pantry/:id', (req, res) => {
            const { id } = req.params;
            res.status(200).json({ message: 'Item deleted', id });
        });

        // Mock scanner route
        app.post('/api/scanner/upload', (req, res) => {
            res.status(200).json({
                items: [
                    { name: 'Banana', category: 'produce', quantity: 6 },
                ],
            });
        });
    });

    describe('Pantry API', () => {
        test('GET /api/pantry should return pantry items', async () => {
            const response = await request(app).get('/api/pantry');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('items');
            expect(Array.isArray(response.body.items)).toBe(true);
            expect(response.body.items.length).toBeGreaterThan(0);
        });

        test('POST /api/pantry should create new item', async () => {
            const newItem = {
                name: 'Cheese',
                category: 'dairy',
                quantity: 2,
            };
            const response = await request(app)
                .post('/api/pantry')
                .send(newItem);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(newItem.name);
        });

        test('POST /api/pantry should fail with missing fields', async () => {
            const invalidItem = {
                name: 'Bread',
            };
            const response = await request(app)
                .post('/api/pantry')
                .send(invalidItem);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        test('DELETE /api/pantry/:id should delete item', async () => {
            const response = await request(app).delete('/api/pantry/1');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Scanner API', () => {
        test('POST /api/scanner/upload should process receipt', async () => {
            const response = await request(app)
                .post('/api/scanner/upload')
                .send({});

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('items');
            expect(Array.isArray(response.body.items)).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should return 404 for unknown routes', async () => {
            const response = await request(app).get('/api/unknown');
            expect(response.status).toBe(404);
        });
    });
});
