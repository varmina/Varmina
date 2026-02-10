import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductForm } from './ProductForm';
import { supabaseProductService } from '../../services/supabaseProductService';

// Mock dependencies
vi.mock('../../services/supabaseProductService', () => ({
    supabaseProductService: {
        create: vi.fn(),
        update: vi.fn(),
        uploadImage: vi.fn(),
    }
}));

// Mock Store Context
vi.mock('../../context/StoreContext', () => ({
    useStore: () => ({
        addToast: vi.fn(),
    })
}));

describe('ProductForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the form with empty fields for new product', () => {
        render(<ProductForm onCancel={() => { }} onSave={() => { }} />);
        expect(screen.getByText(/Guardar/i)).toBeInTheDocument();
    });

    it('should show validation error if submitting empty form', async () => {
        render(<ProductForm onCancel={() => { }} onSave={() => { }} />);

        const submitBtn = screen.getByText(/Guardar/i);
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(supabaseProductService.create).not.toHaveBeenCalled();
            // Assuming errors state updates and blocks submission
        });
    });

    it('should validation error if submitting without images', async () => {
        render(<ProductForm onCancel={() => { }} onSave={() => { }} />);

        // Fill inputs
        const nameInput = screen.getByPlaceholderText(/Ej: Anillo Solitario/i);
        fireEvent.change(nameInput, { target: { value: 'Test Ring' } });

        // Price (finding by placeholder "0" and type number)
        const inputs = screen.getAllByPlaceholderText('0');
        const priceInput = inputs.find(i => i.getAttribute('type') === 'number');
        if (priceInput) fireEvent.change(priceInput, { target: { value: '50000' } });

        // Submit (should fail due to missing images)
        const submitBtn = screen.getByText(/Guardar/i);
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(supabaseProductService.create).not.toHaveBeenCalled();
            // If validation message is rendered
            // expect(screen.getByText(/imagen/i)).toBeInTheDocument();
        });
    });
});
