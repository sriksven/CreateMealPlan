import { Request, Response } from 'express';
import { getPantryHistory, getActivityCalendar, getHistoryByDate } from '../../controllers/history.controller';
import { db } from '../../config/firebase';

// Mock DB
jest.mock('../../config/firebase', () => ({
    db: {
        collection: jest.fn(),
    }
}));

describe('History Controller', () => {
    let req: any;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = {
            user: { uid: 'test-user-history' },
            body: {},
            query: {},
            params: {}
        };
        res = {
            status: statusMock,
            json: jsonMock,
        };
        jest.clearAllMocks();
    });

    // Helper to create mock docs
    const createMockDocs = (data: any[]) => ({
        docs: data.map(d => ({
            id: 'doc-id',
            data: () => d
        }))
    });

    describe('getPantryHistory', () => {
        it('should return sorted history', async () => {
            // Mock 2 history items
            const mockData = [
                { timestamp: { toDate: () => new Date('2023-01-01') }, source: 'manual' },
                { timestamp: { toDate: () => new Date('2023-01-02') }, source: 'receipt' } // Newer
            ];

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        get: jest.fn().mockResolvedValue(createMockDocs(mockData))
                    })
                })
            });

            await getPantryHistory(req, res as Response);

            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ history: expect.any(Array) }));
            const history = jsonMock.mock.calls[0][0].history;
            expect(history).toHaveLength(2);
            // Verify sort order: newer first
            expect(new Date(history[0].timestamp).getTime()).toBeGreaterThan(new Date(history[1].timestamp).getTime());
        });

        it('should return 401 if unauthorized', async () => {
            req.user = undefined;
            await getPantryHistory(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(401);
        });
    });

    describe('getActivityCalendar', () => {
        it('should filter and group activity by date', async () => {
            req.query = { startDate: '2023-01-01', endDate: '2023-01-31' };

            const mockData = [
                { timestamp: { toDate: () => new Date('2023-01-05T10:00:00Z') }, source: 'manual' },
                { timestamp: { toDate: () => new Date('2023-01-05T12:00:00Z') }, source: 'receipt' }, // Same day
                { timestamp: { toDate: () => new Date('2023-02-01') }, source: 'manual' } // Out of range
            ];

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        get: jest.fn().mockResolvedValue(createMockDocs(mockData))
                    })
                })
            });

            await getActivityCalendar(req, res as Response);

            const calendar = jsonMock.mock.calls[0][0].calendar;
            expect(calendar['2023-01-05']).toBeDefined();
            expect(calendar['2023-01-05'].manual).toBe(1);
            expect(calendar['2023-01-05'].receipt).toBe(1);
            expect(calendar['2023-02-01']).toBeUndefined();
        });
    });

    describe('getHistoryByDate', () => {
        it('should return items for specific date', async () => {
            req.params = { date: '2023-01-05' };
            const mockData = [
                { timestamp: { toDate: () => new Date('2023-01-05T10:00:00Z') }, item: 'Apple' },
                { timestamp: { toDate: () => new Date('2023-01-06T10:00:00Z') }, item: 'Banana' }
            ];

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        get: jest.fn().mockResolvedValue(createMockDocs(mockData))
                    })
                })
            });

            await getHistoryByDate(req, res as Response);
            const history = jsonMock.mock.calls[0][0].history;
            expect(history).toHaveLength(1);
            expect(history[0].item).toBe('Apple');
        });
    });
});
