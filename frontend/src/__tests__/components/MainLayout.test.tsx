import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';

// Mock Firebase auth
vi.mock('../../firebase', () => ({
    auth: {
        currentUser: { uid: 'test-user' },
    },
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        currentUser: { uid: 'test-user', email: 'test@example.com' },
        logout: vi.fn(),
    }),
}));

describe('MainLayout Component', () => {
    test('should render without crashing', () => {
        expect(() =>
            render(
                <BrowserRouter>
                    <MainLayout />
                </BrowserRouter>
            )
        ).not.toThrow();
    });

    test('should render navigation elements', () => {
        const { container } = render(
            <BrowserRouter>
                <MainLayout />
            </BrowserRouter>
        );

        const navElements = container.querySelectorAll('nav');
        expect(navElements.length).toBeGreaterThan(0);
    });

    test('component should be defined', () => {
        expect(MainLayout).toBeDefined();
    });
});
