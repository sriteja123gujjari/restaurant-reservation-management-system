import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import Navbar from '../Navbar';
import { AuthProvider } from '../../context/AuthContext'; // Adjust path if needed

describe('Navbar Component', () => {
    test('renders navbar links without crashing', () => {
        render(
            <AuthProvider>
                <BrowserRouter>
                    <Navbar />
                </BrowserRouter>
            </AuthProvider>
        );

        const navElement = screen.getByRole('navigation') || screen.getByText(/restaurant|reserve|home|login|logout/i);
        expect(navElement).toBeInTheDocument();
    });
});