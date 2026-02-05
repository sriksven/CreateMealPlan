import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

// Mock Firebase
vi.mock('../../firebase', () => ({
    auth: {},
    googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Authentication Integration Tests', () => {
    test('Login page should render without crashing', () => {
        expect(() =>
            render(
                <BrowserRouter>
                    <LoginPage />
                </BrowserRouter>
            )
        ).not.toThrow();
    });

    test('LoginPage component should be defined', () => {
        expect(LoginPage).toBeDefined();
    });

    test('Should render a form element', () => {
        const { container } = render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const forms = container.querySelectorAll('form');
        expect(forms.length).toBeGreaterThan(0);
    });
});
