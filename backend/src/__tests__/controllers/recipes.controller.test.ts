import { Request, Response } from 'express';
import { db } from '../../config/firebase';

// 1. Define helper mocks BEFORE importing the controller
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent
});

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel
    }))
}));

jest.mock('../../config/firebase', () => ({
    db: {
        collection: jest.fn(),
    }
}));

// 2. Import controller AFTER mocks
import { generateRecipes } from '../../controllers/recipes.controller';

describe('Recipes Controller', () => {
    let req: any;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = {
            user: { uid: 'test-user-123' },
            body: {}
        };
        res = {
            status: statusMock,
            json: jsonMock,
        };
        jest.clearAllMocks();

        // Reset specific mock implementations
        mockGenerateContent.mockReset();
    });

    describe('generateRecipes', () => {
        it('should return 400 if no cuisine', async () => {
            req.body = {};
            await generateRecipes(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it('should return 400 if pantry empty', async () => {
            req.body = { cuisine: 'Italian' };
            const emptyPantry = { docs: [] };
            const userProfile = { data: () => ({ proteinTarget: 150 }) };

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(emptyPantry) }),
                doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(userProfile) })
            });

            await generateRecipes(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/pantry is empty/) }));
        });

        it('should generate recipes successfully', async () => {
            req.body = { cuisine: 'Italian' };

            // Mock DB
            const pantryDocs = {
                docs: [
                    { data: () => ({ name: 'Tomato' }) },
                    { data: () => ({ name: 'Pasta' }) }
                ]
            };
            const userProfile = {
                data: () => ({ proteinTarget: 150, gender: 'Male' })
            };

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(pantryDocs) }),
                doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(userProfile) })
            });

            // Mock GenAI Response
            const mockRecipes = { recipes: [{ title: 'Pasta' }] };
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockRecipes)
                }
            });

            await generateRecipes(req, res as Response);

            expect(jsonMock).toHaveBeenCalledWith(mockRecipes);
        });

        it('should handle invalid JSON from AI', async () => {
            req.body = { cuisine: 'Italian' };

            // Mock DB (same setup)
            const pantryDocs = { docs: [{ data: () => ({ name: 'Tomato' }) }] };
            const userProfile = { data: () => ({}) };
            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(pantryDocs) }),
                doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue(userProfile) })
            });

            // Mock Bad JSON
            mockGenerateContent.mockResolvedValue({
                response: { text: () => "Invalid JSON" }
            });

            await generateRecipes(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
        });
    });
});
