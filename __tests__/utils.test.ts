/**
 * Tests para helpers de utilidades
 */

describe('Utility Helpers', () => {
    describe('formatDate', () => {
        /**
         * Helper para formatear fechas de manera segura
         * Evita problemas de timezone usando la fecha local
         */
        const formatDate = (date: Date | string): string => {
            const d = typeof date === 'string' ? new Date(date) : date;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        it('debe formatear una fecha de tipo Date correctamente', () => {
            const date = new Date('2025-01-15T10:30:00');
            const formatted = formatDate(date);
            expect(formatted).toBe('2025-01-15');
        });

        it('debe formatear una fecha de tipo string correctamente', () => {
            const dateString = '2025-12-25T00:00:00';
            const formatted = formatDate(dateString);
            expect(formatted).toBe('2025-12-25');
        });

        it('debe agregar ceros a la izquierda en meses y días de un dígito', () => {
            const date = new Date('2025-01-05T10:30:00');
            const formatted = formatDate(date);
            expect(formatted).toBe('2025-01-05');
        });

        it('debe manejar el último día del año', () => {
            const date = new Date('2025-12-31T23:59:59');
            const formatted = formatDate(date);
            expect(formatted).toBe('2025-12-31');
        });

        it('debe manejar el primer día del año', () => {
            const date = new Date('2025-01-01T00:00:00');
            const formatted = formatDate(date);
            expect(formatted).toBe('2025-01-01');
        });
    });

    describe('formatMoney', () => {
        /**
         * Helper para formatear cantidades de dinero
         * Usa formato colombiano (es-CO)
         */
        const formatMoney = (amount: number): string => {
            return amount.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        };

        it('debe formatear cantidades positivas correctamente', () => {
            const amount = 1000000;
            const formatted = formatMoney(amount);
            expect(formatted).toContain('1.000.000');
            expect(formatted).toContain('$');
        });

        it('debe formatear cantidades negativas correctamente', () => {
            const amount = -500000;
            const formatted = formatMoney(amount);
            expect(formatted).toContain('500.000');
        });

        it('debe formatear cero correctamente', () => {
            const amount = 0;
            const formatted = formatMoney(amount);
            expect(formatted).toContain('0');
            expect(formatted).toContain('$');
        });

        it('debe formatear cantidades pequeñas sin decimales', () => {
            const amount = 100;
            const formatted = formatMoney(amount);
            expect(formatted).not.toContain(',');
            expect(formatted).toContain('100');
        });

        it('debe usar separadores de miles correctamente', () => {
            const amount = 1234567;
            const formatted = formatMoney(amount);
            expect(formatted).toContain('1.234.567');
        });
    });

    describe('Role Validation', () => {
        /**
         * Helper para validar roles de usuario
         */
        const isValidRole = (role: string): boolean => {
            return role === 'USER' || role === 'ADMIN';
        };

        const isAdmin = (role: string): boolean => {
            return role === 'ADMIN';
        };

        it('debe validar el rol ADMIN como válido', () => {
            expect(isValidRole('ADMIN')).toBe(true);
        });

        it('debe validar el rol USER como válido', () => {
            expect(isValidRole('USER')).toBe(true);
        });

        it('debe rechazar roles inválidos', () => {
            expect(isValidRole('SUPERADMIN')).toBe(false);
            expect(isValidRole('guest')).toBe(false);
            expect(isValidRole('')).toBe(false);
        });

        it('debe identificar correctamente usuarios ADMIN', () => {
            expect(isAdmin('ADMIN')).toBe(true);
            expect(isAdmin('USER')).toBe(false);
        });

        it('debe ser case-sensitive para roles', () => {
            expect(isValidRole('admin')).toBe(false);
            expect(isValidRole('user')).toBe(false);
        });
    });
});
