/**
 * Tests para validación de transacciones
 */

import { TransactionType } from '@prisma/client';

describe('Transaction Validation', () => {
    describe('Transaction Type Validation', () => {
        const isValidTransactionType = (type: string): boolean => {
            return type === 'INGRESO' || type === 'EGRESO';
        };

        it('debe validar INGRESO como tipo válido', () => {
            expect(isValidTransactionType('INGRESO')).toBe(true);
        });

        it('debe validar EGRESO como tipo válido', () => {
            expect(isValidTransactionType('EGRESO')).toBe(true);
        });

        it('debe rechazar tipos inválidos', () => {
            expect(isValidTransactionType('GASTO')).toBe(false);
            expect(isValidTransactionType('INCOME')).toBe(false);
            expect(isValidTransactionType('')).toBe(false);
        });

        it('debe ser case-sensitive', () => {
            expect(isValidTransactionType('ingreso')).toBe(false);
            expect(isValidTransactionType('egreso')).toBe(false);
        });
    });

    describe('Transaction Amount Validation', () => {
        const isValidAmount = (amount: number): boolean => {
            return amount > 0 && Number.isFinite(amount);
        };

        it('debe aceptar cantidades positivas', () => {
            expect(isValidAmount(1000)).toBe(true);
            expect(isValidAmount(0.01)).toBe(true);
            expect(isValidAmount(1000000)).toBe(true);
        });

        it('debe rechazar cantidades negativas', () => {
            expect(isValidAmount(-100)).toBe(false);
        });

        it('debe rechazar cero', () => {
            expect(isValidAmount(0)).toBe(false);
        });

        it('debe rechazar valores no finitos', () => {
            expect(isValidAmount(Infinity)).toBe(false);
            expect(isValidAmount(-Infinity)).toBe(false);
            expect(isValidAmount(NaN)).toBe(false);
        });
    });

    describe('Transaction Description Validation', () => {
        const isValidDescription = (description: string): boolean => {
            return description.trim().length > 0 && description.length <= 500;
        };

        it('debe aceptar descripciones válidas', () => {
            expect(isValidDescription('Compra de mercado')).toBe(true);
            expect(isValidDescription('Salario mensual')).toBe(true);
        });

        it('debe rechazar descripciones vacías', () => {
            expect(isValidDescription('')).toBe(false);
            expect(isValidDescription('   ')).toBe(false);
        });

        it('debe rechazar descripciones muy largas', () => {
            const longDescription = 'a'.repeat(501);
            expect(isValidDescription(longDescription)).toBe(false);
        });

        it('debe aceptar descripciones con el límite exacto', () => {
            const maxDescription = 'a'.repeat(500);
            expect(isValidDescription(maxDescription)).toBe(true);
        });
    });

    describe('Transaction Date Validation', () => {
        const isValidDate = (dateString: string): boolean => {
            const date = new Date(dateString);
            return !isNaN(date.getTime());
        };

        it('debe validar fechas en formato ISO', () => {
            expect(isValidDate('2025-01-15')).toBe(true);
            expect(isValidDate('2025-12-31T23:59:59')).toBe(true);
        });

        it('debe rechazar fechas inválidas', () => {
            expect(isValidDate('invalid-date')).toBe(false);
            expect(isValidDate('2025-13-45')).toBe(false);
        });

        it('debe rechazar strings vacíos', () => {
            expect(isValidDate('')).toBe(false);
        });
    });

    describe('Calculate Transaction Balance', () => {
        interface Transaction {
            type: TransactionType;
            amount: number;
        }

        const calculateBalance = (transactions: Transaction[]): number => {
            return transactions.reduce((balance, transaction) => {
                if (transaction.type === 'INGRESO') {
                    return balance + transaction.amount;
                } else {
                    return balance - transaction.amount;
                }
            }, 0);
        };

        it('debe calcular balance con solo ingresos', () => {
            const transactions: Transaction[] = [
                { type: 'INGRESO' as TransactionType, amount: 1000 },
                { type: 'INGRESO' as TransactionType, amount: 2000 },
            ];
            expect(calculateBalance(transactions)).toBe(3000);
        });

        it('debe calcular balance con solo egresos', () => {
            const transactions: Transaction[] = [
                { type: 'EGRESO' as TransactionType, amount: 500 },
                { type: 'EGRESO' as TransactionType, amount: 300 },
            ];
            expect(calculateBalance(transactions)).toBe(-800);
        });

        it('debe calcular balance mixto correctamente', () => {
            const transactions: Transaction[] = [
                { type: 'INGRESO' as TransactionType, amount: 5000 },
                { type: 'EGRESO' as TransactionType, amount: 2000 },
                { type: 'INGRESO' as TransactionType, amount: 1000 },
                { type: 'EGRESO' as TransactionType, amount: 500 },
            ];
            expect(calculateBalance(transactions)).toBe(3500);
        });

        it('debe retornar 0 para array vacío', () => {
            expect(calculateBalance([])).toBe(0);
        });
    });
});
