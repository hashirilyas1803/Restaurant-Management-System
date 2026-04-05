describe('Business Logic: Total Calculation Rounding', () => {
    it('should round floating point totals to 2 decimal places', () => {
        const calculatedTotal = 92.46000000000001;
        const roundedTotal = Math.round(calculatedTotal * 100) / 100;
        
        expect(roundedTotal).toBe(92.46);
        
        // Use a fallback string to prevent "Object is possibly undefined" errors
        const decimalPart = roundedTotal.toString().split('.')[1] || '';
        expect(decimalPart.length).toBeLessThanOrEqual(2);
    });

    it('should handle whole integers safely', () => {
        const calculatedTotal = 100.00000;
        const roundedTotal = Math.round(calculatedTotal * 100) / 100;
        
        expect(roundedTotal).toBe(100);
        
        const decimalPart = roundedTotal.toString().split('.')[1] || '';
        expect(decimalPart.length).toBe(0);
    });
});