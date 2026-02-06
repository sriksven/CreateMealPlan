import { Request, Response } from 'express';
import { getProfile, updateProfile, resetUserData, analyzeBiometrics } from '../../controllers/user.controller';
import { db } from '../../config/firebase';
import groq from '../../config/groq';

// Mock Dependencies
jest.mock('../../config/firebase', () => ({
    db: {
        collection: jest.fn(),
        batch: jest.fn(),
    }
}));

jest.mock('../../config/groq', () => ({
    chat: {
        completions: {
            create: jest.fn(),
        }
    }
}));

describe('User Controller', () => {
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
    });

    describe('getProfile', () => {
        it('should return profile if exists', async () => {
            const mockData = { proteinTarget: 150 };
            const getDocMock = jest.fn().mockResolvedValue({
                exists: true,
                data: () => mockData
            });
            (db.collection as jest.Mock).mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: getDocMock
                })
            });

            await getProfile(req, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(mockData);
        });

        it('should create default profile if not exists', async () => {
            const setMock = jest.fn();
            const getDocMock = jest.fn()
                .mockResolvedValueOnce({ exists: false }) // First check
                .mockResolvedValueOnce({ data: () => ({ proteinTarget: 140 }) }); // After set

            (db.collection as jest.Mock).mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: getDocMock,
                    set: setMock
                })
            });

            await getProfile(req, res as Response);
            expect(setMock).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    describe('updateProfile', () => {
        it('should validate entries', async () => {
            req.body = { proteinTarget: 10 }; // Invalid low
            await updateProfile(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);

            req.body = { proteinTarget: 150, calorieTarget: 100 }; // Invalid low
            await updateProfile(req, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });

        it('should update valid profile', async () => {
            req.body = { proteinTarget: 180, weight: 80 };
            const setMock = jest.fn();
            (db.collection as jest.Mock).mockReturnValue({
                doc: jest.fn().mockReturnValue({ set: setMock })
            });

            await updateProfile(req, res as Response);
            expect(setMock).toHaveBeenCalledWith(expect.objectContaining({
                proteinTarget: 180,
                weight: 80
            }), { merge: true });
            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    describe('resetUserData', () => {
        it('should delete pantry and history items', async () => {
            const batchDelete = jest.fn();
            const batchCommit = jest.fn();
            (db.batch as jest.Mock).mockReturnValue({
                delete: batchDelete,
                commit: batchCommit
            });

            const pantryDocs = {
                size: 2,
                docs: [{ ref: 'p1' }, { ref: 'p2' }]
            };
            const historyDocs = {
                size: 1,
                docs: [{ ref: 'h1' }]
            };

            const getMock = jest.fn()
                .mockResolvedValueOnce(pantryDocs)
                .mockResolvedValueOnce(historyDocs);

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({ get: getMock })
            });

            await resetUserData(req, res as Response);

            expect(batchDelete).toHaveBeenCalledTimes(3); // 2 pantry + 1 history
            expect(batchCommit).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });

    describe('analyzeBiometrics', () => {
        it('should return analysis from Groq', async () => {
            req.body = { gender: 'Male', weight: 80, height: 180, age: 30 };

            const mockResponse = { bmi: 24.7, status: 'Normal' };
            (groq.chat.completions.create as jest.Mock).mockResolvedValue({
                choices: [{ message: { content: JSON.stringify(mockResponse) } }]
            });

            await analyzeBiometrics(req as Request, res as Response);

            expect(jsonMock).toHaveBeenCalledWith(mockResponse);
        });

        it('should return 400 if missing fields', async () => {
            req.body = { gender: 'Male' }; // Missing weight/height
            await analyzeBiometrics(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
        });
    });
});
