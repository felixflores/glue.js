# glue.js

[![CI](https://github.com/felixflores/glue.js/actions/workflows/ci.yml/badge.svg)](https://github.com/felixflores/glue.js/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/glue.js.svg)](https://badge.fury.io/js/glue.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://codecov.io/gh/felixflores/glue.js/branch/master/graph/badge.svg)](https://codecov.io/gh/felixflores/glue.js)
[![Node.js Version](https://img.shields.io/node/v/glue.js.svg)](https://nodejs.org)
[![npm downloads](https://img.shields.io/npm/dm/glue.js.svg)](https://www.npmjs.com/package/glue.js)

# Make your data reactive like magic ✨

**What if changing one value in your JavaScript object automatically updated everything that depends on it?**

Like Excel, but for your app's data. No frameworks, no build tools, no configuration. Just **reactive magic**.

```javascript
// Your shopping cart updates itself automatically
const cart = { items: [], total: 0 };
const glue = new Glue(cart);

// When items change, total recalculates instantly
glue.addObserver('items', () => {
  const total = glue.get('items').reduce((sum, item) => sum + item.price, 0);
  glue.set('total', total);
});

glue.push('items', { name: 'Coffee', price: 5 });
console.log(glue.get('total')); // 5 - calculated automatically!
```

**That's it.** No reducers, no state management, no complex setup. Just reactive data that works.

## 🤯 Why would I want this?

Because managing state sucks. You've been there:

```javascript
// The old way: Manual updates everywhere 😩
function updateCart() {
  const items = getItems();
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;
  
  updateSubtotalDisplay(subtotal);
  updateTaxDisplay(tax);
  updateShippingDisplay(shipping);
  updateTotalDisplay(total);
  updateCartBadge(items.length);
  
  // Oh wait, forgot to update the checkout button state...
  // And the recommendations engine...
  // And the analytics event...
}
```

**With glue.js:** Everything just updates automatically 🎯

```javascript
const cart = new Glue({ items: [], subtotal: 0, tax: 0, total: 0 });

// Set up the magic once
cart.addObserver('items', updateSubtotal);
cart.addObserver('subtotal', updateTax);
cart.addObserver('subtotal', updateTotal);
cart.addObserver('tax', updateTotal);

// Now just change data - everything else happens automatically
cart.push('items', { name: 'iPhone', price: 999 });
// ✨ Subtotal, tax, and total all update instantly
```

## 🔥 Perfect for...

### **Form Validation That Actually Works**
```javascript
const form = new Glue({ email: '', password: '', errors: {} });

form.addObserver('email', () => {
  const email = form.get('email');
  if (!email.includes('@')) {
    form.set('errors.email', 'Please enter a valid email');
  } else {
    form.remove('errors.email');
  }
});

// Type in email field → validation happens instantly
// No more managing validation state manually!
```

### **Real-time Dashboards** 
```javascript
const dashboard = new Glue({ 
  users: [], 
  activeUsers: 0, 
  revenue: 0, 
  conversionRate: 0 
});

// When users change, everything updates
dashboard.addObserver('users', () => {
  const users = dashboard.get('users');
  dashboard.set('activeUsers', users.filter(u => u.active).length);
  dashboard.set('revenue', users.reduce((sum, u) => sum + u.spent, 0));
  dashboard.set('conversionRate', dashboard.get('activeUsers') / users.length);
});

// Add a user → all metrics update automatically
```

### **Game Scores & Leaderboards**
```javascript
const game = new Glue({ 
  players: [], 
  topPlayer: null, 
  averageScore: 0 
});

game.addObserver('players', () => {
  const players = game.get('players');
  const sorted = players.sort((a, b) => b.score - a.score);
  game.set('topPlayer', sorted[0]);
  game.set('averageScore', players.reduce((sum, p) => sum + p.score, 0) / players.length);
});

// Player scores change → leaderboard updates instantly
```

## 🚀 Get Started (30 seconds)

```bash
npm install glue.js
```

```javascript
const Glue = require('glue.js');

const data = new Glue({ count: 0, doubled: 0 });

// When count changes, doubled updates automatically
data.addObserver('count', () => {
  data.set('doubled', data.get('count') * 2);
});

data.set('count', 5);
console.log(data.get('doubled')); // 10 ✨
```

**That's literally it.** No webpack, no babel, no configuration. Just reactive data.

## 🎯 Why glue.js wins

- **Zero dependencies** - No bloat, no security vulnerabilities, no version conflicts
- **Tiny footprint** - Less than 10KB, works everywhere (even IE11)
- **Zero configuration** - No build tools, no setup, no framework lock-in
- **Actually simple** - If you understand `addEventListener`, you understand glue.js
- **Production proven** - Running in production apps for over a decade

## 🧠 When to use it

**Perfect for:**
- Interactive forms and validation
- Real-time dashboards and analytics
- Shopping carts and e-commerce
- Game state and leaderboards  
- Data visualization that updates live
- Any time you have "calculated fields"

**Maybe overkill for:**
- Static websites
- Simple one-way data flow
- Hello world apps

## 📚 Want more?

- **[Complete API Documentation](./docs/api.md)** - Every method, parameter, and option
- **[Advanced Patterns](./docs/patterns.md)** - Deep dives, best practices, and complex examples
- **[Migration Guide](./docs/migration.md)** - Upgrading from older versions
- **[Performance Guide](./docs/performance.md)** - Benchmarks and optimization tips

## 🤝 Contributing

Found a bug? Have an idea? We'd love your help!

1. **[Report issues](https://github.com/felixflores/glue.js/issues)** - Bug reports and feature requests
2. **[Submit PRs](https://github.com/felixflores/glue.js/pulls)** - Code improvements and fixes
3. **[Improve docs](./docs)** - Help make the docs clearer
4. **[Share examples](https://github.com/felixflores/glue.js/discussions)** - Show us what you built!

**Quick dev setup:**
```bash
git clone https://github.com/felixflores/glue.js
cd glue.js
npm install
npm test
```

---

**Made with ❤️ by developers who got tired of state management complexity.**

*Star us on GitHub if glue.js makes your life easier!* ⭐