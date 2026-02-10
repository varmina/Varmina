
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export interface CreateTransactionInput {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string; // ISO date string YYYY-MM-DD
}

export const financeService = {
    // Get all transactions
    getAll: async (limit = 50): Promise<Transaction[]> => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching transactions:', error);
            throw new Error('Error al cargar transacciones.');
        }

        return data || [];
    },

    // Create transaction
    create: async (input: CreateTransactionInput): Promise<Transaction> => {
        if (!input.description) throw new Error('La descripción es obligatoria');
        if (!input.amount || input.amount <= 0) throw new Error('El monto debe ser mayor a 0');
        if (!input.date) throw new Error('La fecha es obligatoria');

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                description: input.description.trim(),
                amount: input.amount,
                type: input.type,
                category: input.category,
                date: input.date
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating transaction:', error);
            throw new Error('Error al guardar la transacción.');
        }

        return data;
    },

    // Delete transaction
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting transaction:', error);
            throw new Error('Error al eliminar la transacción.');
        }
    },

    // Get Balance Summary
    getBalance: async (startDate?: string, endDate?: string) => {
        let query = supabase.from('transactions').select('amount, type');

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query;

        if (error) {
            console.error('Error calculating balance:', error);
            throw new Error('Error al calcular el balance.');
        }

        const income = data
            ?.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        const expense = data
            ?.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        return {
            income,
            expense,
            balance: income - expense
        };
    }
};
