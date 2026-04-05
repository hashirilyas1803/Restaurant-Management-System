import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Security Logic: Hashing and Tokens', () => {
    const rawPassword = "SecurePassword123";
    let hashedPassword = "";

    it('should hash a password consistently', async () => {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(rawPassword, saltRounds);
        
        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).not.toEqual(rawPassword);
    });

    it('should correctly compare a raw password with a hash', async () => {
        const isValid = await bcrypt.compare(rawPassword, hashedPassword);
        expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
        const isValid = await bcrypt.compare("WrongPassword!", hashedPassword);
        expect(isValid).toBe(false);
    });

    it('should sign and verify a JWT token', () => {
        const secret = 'test_secret_key';
        const payload = { userId: 1, role: 'ADMIN' };
        
        // Sign the token
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });
        expect(token).toBeDefined();
        expect(token.split('.').length).toBe(3); // JWTs always have 3 parts

        // Verify the token
        const decoded = jwt.verify(token, secret) as { userId: number, role: string };
        expect(decoded.userId).toBe(payload.userId);
        expect(decoded.role).toBe(payload.role);
    });
});