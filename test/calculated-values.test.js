import { describe, it, expect, vi } from 'vitest';
import Glue from '../lib/glue.js';

describe('Calculated/Computed Values', () => {
  describe('basic calculated properties', () => {
    it('should automatically update calculated values when dependencies change', () => {
      const model = {
        firstName: 'John',
        lastName: 'Doe',
        fullName: '' // calculated property
      };
      
      const glue = new Glue(model);
      
      // Set up calculated property
      const updateFullName = () => {
        const firstName = glue.get('firstName');
        const lastName = glue.get('lastName');
        glue.set('fullName', `${firstName} ${lastName}`);
      };
      
      // Watch for changes to dependencies
      glue.addObserver('firstName', updateFullName);
      glue.addObserver('lastName', updateFullName);
      
      // Initial calculation
      updateFullName();
      expect(glue.get('fullName')).toBe('John Doe');
      
      // Change dependency - should auto-update
      glue.set('firstName', 'Jane');
      expect(glue.get('fullName')).toBe('Jane Doe');
      
      glue.set('lastName', 'Smith');
      expect(glue.get('fullName')).toBe('Jane Smith');
    });

    it('should handle complex calculated values with multiple dependencies', () => {
      const model = {
        items: [
          { name: 'Item 1', price: 10, quantity: 2 },
          { name: 'Item 2', price: 20, quantity: 1 },
          { name: 'Item 3', price: 15, quantity: 3 }
        ],
        subtotal: 0,
        tax: 0,
        taxRate: 0.08,
        total: 0
      };
      
      const glue = new Glue(model);
      
      // Calculate subtotal when items change
      const updateSubtotal = () => {
        const items = glue.get('items');
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        glue.set('subtotal', subtotal);
      };
      
      // Calculate tax when subtotal or tax rate changes
      const updateTax = () => {
        const subtotal = glue.get('subtotal');
        const taxRate = glue.get('taxRate');
        glue.set('tax', subtotal * taxRate);
      };
      
      // Calculate total when subtotal or tax changes
      const updateTotal = () => {
        const subtotal = glue.get('subtotal');
        const tax = glue.get('tax');
        glue.set('total', subtotal + tax);
      };
      
      // Set up observers for dependency chain
      glue.addObserver('items', updateSubtotal);
      glue.addObserver('subtotal', updateTax);
      glue.addObserver('subtotal', updateTotal);
      glue.addObserver('tax', updateTotal);
      glue.addObserver('taxRate', updateTax);
      
      // Initial calculation
      updateSubtotal();
      
      expect(glue.get('subtotal')).toBe(85); // (10*2) + (20*1) + (15*3) = 20+20+45 = 85
      expect(glue.get('tax')).toBe(6.8); // 85 * 0.08
      expect(glue.get('total')).toBe(91.8); // 85 + 6.8
      
      // Change tax rate - should cascade
      glue.set('taxRate', 0.10);
      expect(glue.get('tax')).toBe(8.5); // 85 * 0.10
      expect(glue.get('total')).toBe(93.5); // 85 + 8.5
    });
  });

  describe('reactive data transformations', () => {
    it('should update filtered lists when source data changes', () => {
      const model = {
        users: [
          { name: 'Alice', active: true, role: 'admin' },
          { name: 'Bob', active: false, role: 'user' },
          { name: 'Charlie', active: true, role: 'user' },
          { name: 'David', active: true, role: 'admin' }
        ],
        activeUsers: [],
        adminUsers: []
      };
      
      const glue = new Glue(model);
      let filterCallCount = 0;
      
      const updateActiveUsers = () => {
        filterCallCount++;
        const users = glue.get('users');
        const active = users.filter(user => user.active);
        glue.set('activeUsers', active);
      };
      
      const updateAdminUsers = () => {
        const users = glue.get('users');
        const admins = users.filter(user => user.role === 'admin');
        glue.set('adminUsers', admins);
      };
      
      glue.addObserver('users', updateActiveUsers);
      glue.addObserver('users', updateAdminUsers);
      
      // Initial calculation
      updateActiveUsers();
      updateAdminUsers();
      
      expect(glue.get('activeUsers')).toHaveLength(3);
      expect(glue.get('adminUsers')).toHaveLength(2);
      expect(filterCallCount).toBe(1);
      
      // Add new user - should trigger recalculation
      const users = glue.get('users');
      const newUsers = [...users, { name: 'Eve', active: true, role: 'user' }];
      glue.set('users', newUsers);
      
      expect(glue.get('activeUsers')).toHaveLength(4);
      expect(filterCallCount).toBe(2);
    });

    it('should handle deep dependency chains', () => {
      const model = {
        config: {
          multiplier: 2,
          offset: 10
        },
        input: 5,
        processed: 0, // input * multiplier
        result: 0     // processed + offset
      };
      
      const glue = new Glue(model);
      const calculations = [];
      
      const updateProcessed = () => {
        calculations.push('processed');
        const input = glue.get('input');
        const multiplier = glue.get('config.multiplier');
        glue.set('processed', input * multiplier);
      };
      
      const updateResult = () => {
        calculations.push('result');
        const processed = glue.get('processed');
        const offset = glue.get('config.offset');
        glue.set('result', processed + offset);
      };
      
      glue.addObserver('input', updateProcessed);
      glue.addObserver('config.multiplier', updateProcessed);
      glue.addObserver('processed', updateResult);
      glue.addObserver('config.offset', updateResult);
      
      // Initial calculation
      updateProcessed();
      
      expect(glue.get('processed')).toBe(10); // 5 * 2
      expect(glue.get('result')).toBe(20);    // 10 + 10
      
      // Change input - should cascade
      calculations.length = 0;
      glue.set('input', 8);
      expect(calculations).toEqual(['processed', 'result']);
      expect(glue.get('processed')).toBe(16); // 8 * 2
      expect(glue.get('result')).toBe(26);    // 16 + 10
      
      // Change config - should cascade  
      calculations.length = 0;
      glue.set('config.multiplier', 3);
      expect(calculations).toEqual(['processed', 'result']);
      expect(glue.get('processed')).toBe(24); // 8 * 3
      expect(glue.get('result')).toBe(34);    // 24 + 10
    });
  });

  describe('performance with calculated values', () => {
    it('should efficiently handle many calculated properties', () => {
      const model = {
        numbers: Array.from({ length: 100 }, (_, i) => i + 1),
        sum: 0,
        average: 0,
        count: 0,
        min: 0,
        max: 0
      };
      
      const glue = new Glue(model);
      let calculationCount = 0;
      
      const recalculate = () => {
        calculationCount++;
        const numbers = glue.get('numbers');
        
        const sum = numbers.reduce((a, b) => a + b, 0);
        const count = numbers.length;
        const average = sum / count;
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);
        
        glue.set('sum', sum);
        glue.set('count', count);
        glue.set('average', average);
        glue.set('min', min);
        glue.set('max', max);
      };
      
      glue.addObserver('numbers', recalculate);
      
      // Initial calculation
      const start = performance.now();
      recalculate();
      const time = performance.now() - start;
      
      expect(glue.get('sum')).toBe(5050);
      expect(glue.get('average')).toBe(50.5);
      expect(glue.get('min')).toBe(1);
      expect(glue.get('max')).toBe(100);
      expect(calculationCount).toBe(1);
      expect(time).toBeLessThan(10); // Should be very fast
      
      // Modify data  
      const numbers = glue.get('numbers');
      const newNumbers = [...numbers, 101];
      glue.set('numbers', newNumbers);
      
      expect(glue.get('sum')).toBe(5151);
      expect(glue.get('max')).toBe(101);
      expect(calculationCount).toBe(2);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle shopping cart calculations', () => {
      const cart = {
        items: [
          { id: 1, name: 'Widget', price: 9.99, quantity: 2, category: 'electronics' },
          { id: 2, name: 'Gadget', price: 15.50, quantity: 1, category: 'electronics' },
          { id: 3, name: 'Book', price: 12.99, quantity: 3, category: 'books' }
        ],
        discountCode: 'SAVE10',
        discountPercent: 0,
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0
      };
      
      const glue = new Glue(cart);
      
      // Business logic for calculations
      const updateSubtotal = () => {
        const items = glue.get('items');
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        glue.set('subtotal', Math.round(subtotal * 100) / 100);
      };
      
      const updateDiscount = () => {
        const code = glue.get('discountCode');
        const percent = code === 'SAVE10' ? 0.1 : code === 'SAVE20' ? 0.2 : 0;
        glue.set('discountPercent', percent);
        
        const subtotal = glue.get('subtotal');
        const discount = subtotal * percent;
        glue.set('discount', Math.round(discount * 100) / 100);
      };
      
      const updateShipping = () => {
        const subtotal = glue.get('subtotal');
        const discount = glue.get('discount');
        const afterDiscount = subtotal - discount;
        const shipping = afterDiscount > 50 ? 0 : 5.99;
        glue.set('shipping', shipping);
      };
      
      const updateTax = () => {
        const subtotal = glue.get('subtotal');
        const discount = glue.get('discount');
        const taxable = subtotal - discount;
        const tax = taxable * 0.08;
        glue.set('tax', Math.round(tax * 100) / 100);
      };
      
      const updateTotal = () => {
        const subtotal = glue.get('subtotal');
        const discount = glue.get('discount');
        const shipping = glue.get('shipping');
        const tax = glue.get('tax');
        const total = subtotal - discount + shipping + tax;
        glue.set('total', Math.round(total * 100) / 100);
      };
      
      // Set up the dependency chain
      glue.addObserver('items', updateSubtotal);
      glue.addObserver('discountCode', updateDiscount);
      glue.addObserver('subtotal', updateDiscount);
      glue.addObserver('subtotal', updateShipping);
      glue.addObserver('discount', updateShipping);
      glue.addObserver('subtotal', updateTax);
      glue.addObserver('discount', updateTax);
      glue.addObserver('subtotal', updateTotal);
      glue.addObserver('discount', updateTotal);
      glue.addObserver('shipping', updateTotal);
      glue.addObserver('tax', updateTotal);
      
      // Initial calculation
      updateSubtotal();
      
      expect(glue.get('subtotal')).toBe(74.45); // (9.99*2) + 15.50 + (12.99*3)
      expect(glue.get('discount')).toBe(7.45);  // 10% of 74.45 (rounded)
      expect(glue.get('shipping')).toBe(0);     // Free shipping > $50 after discount
      expect(glue.get('tax')).toBe(5.36);       // 8% of (74.45 - 7.45)
      expect(glue.get('total')).toBe(72.36);    // 74.45 - 7.45 + 0 + 5.36
      
      // Change discount code
      glue.set('discountCode', 'SAVE20');
      expect(glue.get('discountPercent')).toBe(0.2);
      expect(glue.get('discount')).toBe(14.89);  // 20% discount
      expect(glue.get('total')).toBe(64.32);     // Recalculated total
    });
  });
});