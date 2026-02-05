import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('Smoke Tests', () => {
    test('App should render without crashing', () => {
        expect(() => render(<App />)).not.toThrow();
    });

    test('App component should be defined', () => {
        expect(App).toBeDefined();
    });

    test('App should render a div element', () => {
        const { container } = render(<App />);
        expect(container.querySelector('div')).toBeTruthy();
    });
});
