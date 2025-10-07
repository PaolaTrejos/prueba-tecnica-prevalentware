/**
 * Tests para validación de usuarios
 */

describe('User Validation', () => {
    describe('Email Validation', () => {
        const isValidEmail = (email: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        it('debe validar emails correctos', () => {
            expect(isValidEmail('user@example.com')).toBe(true);
            expect(isValidEmail('test.user@domain.co')).toBe(true);
            expect(isValidEmail('admin@company.com.co')).toBe(true);
        });

        it('debe rechazar emails sin @', () => {
            expect(isValidEmail('userexample.com')).toBe(false);
        });

        it('debe rechazar emails sin dominio', () => {
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('user@domain')).toBe(false);
        });

        it('debe rechazar emails con espacios', () => {
            expect(isValidEmail('user @example.com')).toBe(false);
            expect(isValidEmail('user@exam ple.com')).toBe(false);
        });

        it('debe rechazar strings vacíos', () => {
            expect(isValidEmail('')).toBe(false);
        });
    });

    describe('Name Validation', () => {
        const isValidName = (name: string): boolean => {
            return name.trim().length >= 2 && name.trim().length <= 100;
        };

        it('debe aceptar nombres válidos', () => {
            expect(isValidName('Juan Pérez')).toBe(true);
            expect(isValidName('María')).toBe(true);
            expect(isValidName('Ana María González')).toBe(true);
        });

        it('debe rechazar nombres muy cortos', () => {
            expect(isValidName('A')).toBe(false);
            expect(isValidName(' ')).toBe(false);
        });

        it('debe rechazar nombres muy largos', () => {
            const longName = 'a'.repeat(101);
            expect(isValidName(longName)).toBe(false);
        });

        it('debe aceptar nombres con el mínimo de caracteres', () => {
            expect(isValidName('Ab')).toBe(true);
        });

        it('debe aceptar nombres con el máximo de caracteres', () => {
            const maxName = 'a'.repeat(100);
            expect(isValidName(maxName)).toBe(true);
        });

        it('debe ignorar espacios al inicio y final', () => {
            expect(isValidName('  Juan  ')).toBe(true);
        });
    });

    describe('Phone Validation', () => {
        const isValidPhone = (phone: string | null): boolean => {
            if (phone === null) return true; // El teléfono es opcional
            const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
            return phoneRegex.test(phone);
        };

        it('debe aceptar teléfonos válidos', () => {
            expect(isValidPhone('3001234567')).toBe(true);
            expect(isValidPhone('+57 300 123 4567')).toBe(true);
            expect(isValidPhone('(1) 234-5678')).toBe(true);
        });

        it('debe aceptar null (campo opcional)', () => {
            expect(isValidPhone(null)).toBe(true);
        });

        it('debe rechazar teléfonos muy cortos', () => {
            expect(isValidPhone('123')).toBe(false);
        });

        it('debe rechazar teléfonos muy largos', () => {
            const longPhone = '1'.repeat(21);
            expect(isValidPhone(longPhone)).toBe(false);
        });

        it('debe rechazar teléfonos con caracteres inválidos', () => {
            expect(isValidPhone('300-ABC-1234')).toBe(false);
            expect(isValidPhone('teléfono')).toBe(false);
        });

        it('debe aceptar formatos internacionales', () => {
            expect(isValidPhone('+1-234-567-8900')).toBe(true);
            expect(isValidPhone('+57 (1) 234-5678')).toBe(true);
        });
    });

    describe('User Permissions', () => {
        interface User {
            id: string;
            role: 'ADMIN' | 'USER';
        }

        const canManageUsers = (user: User): boolean => {
            return user.role === 'ADMIN';
        };

        const canDeleteUser = (currentUser: User, targetUserId: string): boolean => {
            return currentUser.role === 'ADMIN' && currentUser.id !== targetUserId;
        };

        it('debe permitir que ADMIN gestione usuarios', () => {
            const admin: User = { id: '1', role: 'ADMIN' };
            expect(canManageUsers(admin)).toBe(true);
        });

        it('debe impedir que USER gestione usuarios', () => {
            const user: User = { id: '2', role: 'USER' };
            expect(canManageUsers(user)).toBe(false);
        });

        it('debe permitir que ADMIN elimine otros usuarios', () => {
            const admin: User = { id: '1', role: 'ADMIN' };
            expect(canDeleteUser(admin, '2')).toBe(true);
        });

        it('debe impedir que ADMIN se elimine a sí mismo', () => {
            const admin: User = { id: '1', role: 'ADMIN' };
            expect(canDeleteUser(admin, '1')).toBe(false);
        });

        it('debe impedir que USER elimine usuarios', () => {
            const user: User = { id: '2', role: 'USER' };
            expect(canDeleteUser(user, '3')).toBe(false);
        });
    });
});
