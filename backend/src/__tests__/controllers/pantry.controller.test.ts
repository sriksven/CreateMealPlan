import { Request, Response } from 'express';
import { addItemsToPantry, getPantryItems, updatePantryItem, deletePantryItem } from '../../controllers/pantry.controller';
import { db } from '../../config/firebase';
import { normalizeItemName } from '../../utils/normalizeItemName';

// Mock dependencies
jest.mock('../../config/firebase', () => ({
    db: {
        collection: jest.fn(),
        batch: jest.fn(),
    }
}));

jest.mock('../../utils/normalizeItemName', () => ({
    normalizeItemName: jest.fn(),
}));

jest.mock('../../utils/categorize', () => ({
    categorizeItem: jest.fn().mockReturnValue('Produce'),
}));

describe('Pantry Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = {
            body: {},
            params: {},
        } as Partial<Request> & { user: any };
        (req as any).user = { uid: 'test-user-id' };
        res = {
            status: statusMock,
        };
        jest.clearAllMocks();
    });

    describe('addItemsToPantry', () => {
        it('should return 400 if no items provided', async () => {
            req.body = { items: [] };
            await addItemsToPantry(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'No items provided' });
        });

        it('should successfully add new items', async () => {
            req.body = { items: [{ name: 'Tomato', quantity: '2', unit: 'pcs' }] };
            (normalizeItemName as jest.Mock).mockResolvedValue('Tomato');

            const batchCommit = jest.fn().mockResolvedValue(true);
            const batchSet = jest.fn();
            (db.batch as jest.Mock).mockReturnValue({
                commit: batchCommit,
                set: batchSet,
                update: jest.fn(),
            });

            const getMock = jest.fn().mockResolvedValue({ empty: true });
            const whereMock = jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: getMock }) });
            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: getMock }) }),
                doc: jest.fn().mockReturnValue({ id: 'new-doc-id' }),
                add: jest.fn(), // for history
            });

            await addItemsToPantry(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(batchCommit).toHaveBeenCalled();
            expect(batchSet).toHaveBeenCalled();
        });
    });

    describe('getPantryItems', () => {
        it('should fetch items for user', async () => {
            const mockItems = [
                { id: '1', data: () => ({ name: 'Tomato', addedDate: '2023-01-01' }) },
                { id: '2', data: () => ({ name: 'Potato', addedDate: '2023-01-02' }) }
            ];

            const getMock = jest.fn().mockResolvedValue({
                docs: mockItems
            });

            (db.collection as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({ get: getMock })
            });

            await getPantryItems(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ items: expect.any(Array) }));
            // Verify sorting (Potato newer than Tomato)
            expect(jsonMock.mock.calls[0][0].items[0].name).toBe('Potato');
        });
    });

    describe('updatePantryItem', () => {
        it('should update item if owner', async () => {
            req.params = { itemId: 'item-123' };
            req.body = { quantity: '5' };

            const updateMock = jest.fn();
            const getMock = jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ userId: 'test-user-id' })
            });

            (db.collection as jest.Mock).mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: getMock,
                    update: updateMock
                })
            });

            await updatePantryItem(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(updateMock).toHaveBeenCalled();
        });

        it('should return 404 if item not found', async () => {
            req.params = { itemId: 'item-123' };
            const getMock = jest.fn().mockResolvedValue({ exists: false });
            (db.collection as jest.Mock).mockReturnValue({
                doc: jest.fn().mockReturnValue({ get: getMock })
            });
            await updatePantryItem(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(404);
        });

        it('should return 403 if not owner', async () => {
            req.params = { itemId: 'item-123' };
            const getMock = jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ userId: 'other-user' })
            });
            (db.collection as jest.Mock).mockReturnValue({
                doc: jest.fn().mockReturnValue({ get: getMock })
            });
            await updatePantryItem(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(403);
        });
    });

    describe('deletePantryItem', () => {
        it('should delete item if owner', async () => {
            req.params = { itemId: 'item-123' };
            const deleteMock = jest.fn();
            const getMock = jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ userId: 'test-user-id' })
            });

            (db.collection as jest.Mock).mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    get: getMock,
                    delete: deleteMock
                })
            });

            await deletePantryItem(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(deleteMock).toHaveBeenCalled();
        });
    });
});
