import { Request, Response } from 'express';
import { db } from '../../config/firebase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Helpers
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
    generateContent: mockGenerateContent
});

// 2. Mocks
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

jest.mock('../../controllers/pantry.controller', () => ({
    addItemsToPantry: jest.fn().mockImplementation((req, res) => {
        res.status(201).json({ message: 'Saved via pantry controller mockup' });
    })
}));

jest.mock('../../utils/aiGroceryClassifier', () => ({
    classifyGroceryItems: jest.fn().mockResolvedValue([
        { isGrocery: true, confidence: 0.9 },
        { isGrocery: true, confidence: 0.8 }
    ])
}));

// 3. Import Controller
import { scanReceipt, saveScannedItems } from '../../controllers/scanner.controller';
import { addItemsToPantry } from '../../controllers/pantry.controller';

describe('Scanner Controller', () => {
    let req: any;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = {
            user: { uid: 'test-user-scan' },
            body: {}
        };
        res = {
            status: statusMock,
            json: jsonMock,
        };
        jest.clearAllMocks();
        mockGenerateContent.mockReset();
    });

    describe('scanReceipt', () => {
        it('should return 400 if no file', async () => {
            req.file = undefined;
            await scanReceipt(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it('should scan valid receipt successfully', async () => {
            req.file = {
                buffer: Buffer.from('fake-image'),
                mimetype: 'image/jpeg'
            };

            // Mock DB history check (for duplicates)
            const historySnapshot = { docs: [] };
            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            get: jest.fn().mockResolvedValue(historySnapshot)
                        })
                    })
                })
            });

            // Mock Gemini response
            const mockAIResponse = {
                merchantName: 'Test Store',
                date: '2023-10-10',
                totalAmount: '50.00',
                items: [
                    { name: 'Apple', count: '5' },
                    { name: 'Milk', count: '1' }
                ]
            };
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockAIResponse)
                }
            });

            await scanReceipt(req, res as Response);

            expect(mockGenerateContent).toHaveBeenCalled();
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                metadata: expect.objectContaining({ merchantName: 'Test Store' }),
                items: expect.arrayContaining([
                    expect.objectContaining({ name: 'Apple', isGrocery: true })
                ])
            }));
        });

        it('should handle invalid items from AI', async () => {
            req.file = { buffer: Buffer.from('fake'), mimetype: 'image/png' };

            // Mock Gemini to return empty items
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => JSON.stringify({ items: [] })
                }
            });

            await scanReceipt(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringMatching(/No valid items/) }));
        });
    });

    describe('saveScannedItems', () => {
        it('should delegate to pantry controller', async () => {
            req.body = { items: [{ name: 'Apple' }] };
            await saveScannedItems(req, res as Response);
            expect(addItemsToPantry).toHaveBeenCalled();
        });

        it('should return 400 if no items', async () => {
            req.body = { items: [] };
            await saveScannedItems(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });
    });
});
