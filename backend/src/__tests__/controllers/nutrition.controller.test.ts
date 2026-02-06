import { Request, Response } from 'express';
import { logNutrition, getDailyNutrition, getNutritionHistory } from '../../controllers/nutrition.controller';
import { db } from '../../config/firebase';

jest.mock('../../config/firebase', () => ({
    db: {
        collection: jest.fn(),
    }
}));

describe('Nutrition Controller', () => {
    let req: any;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = {
            user: { uid: 'test-user-nutri' },
            body: {}
        };
        res = {
            status: statusMock,
            json: jsonMock,
        };
        jest.clearAllMocks();
    });

    const mockDocs = (data: any[]) => ({
        docs: data.map(d => ({ data: () => d }))
    });

    describe('logNutrition', () => {
        it('should return 400 if missing fields', async () => {
            req.body = { calories: 100 }; // missing protein
            await logNutrition(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it('should log successfully', async () => {
            req.body = { calories: 500, protein: 30, label: 'Lunch' };
            const addMock = jest.fn();
            (db.collection as jest.Mock).mockReturnValue({
                add: addMock
            });

            await logNutrition(req, res as Response);
            expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
                calories: 500,
                protein: 30
            }));
            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    describe('getDailyNutrition', () => {
        it('should sum daily totals', async () => {
            const mockData = [
                { calories: 100, protein: 10 },
                { calories: 200, protein: 20 }
            ];

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        get: jest.fn().mockResolvedValue(mockDocs(mockData))
                    })
                })
            });

            await getDailyNutrition(req, res as Response);
            expect(jsonMock).toHaveBeenCalledWith({ calories: 300, protein: 30 });
        });
    });

    describe('getNutritionHistory', () => {
        it('should group history by date', async () => {
            const today = new Date().toISOString().split('T')[0];
            const mockData = [
                { date: today, calories: 100, protein: 10 },
                { date: today, calories: 100, protein: 10 }, // duplicate day
                { date: '2000-01-01', calories: 500, protein: 50 } // old data (should filter?)
            ];

            // The controller filters > 30 days ago. 2000-01-01 is definitely old.

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    get: jest.fn().mockResolvedValue(mockDocs(mockData))
                })
            });

            await getNutritionHistory(req, res as Response);

            const history = jsonMock.mock.calls[0][0].history;
            expect(history[today]).toBeDefined();
            expect(history[today].calories).toBe(200); // 100+100

            // Should properly filter old dates
            expect(history['2000-01-01']).toBeUndefined();
        });
    });
});
