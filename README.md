# glue.js

[![CI](https://github.com/felixflores/glue.js/actions/workflows/ci.yml/badge.svg)](https://github.com/felixflores/glue.js/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/glue.js.svg)](https://badge.fury.io/js/glue.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://codecov.io/gh/felixflores/glue.js/branch/master/graph/badge.svg)](https://codecov.io/gh/felixflores/glue.js)
[![Node.js Version](https://img.shields.io/node/v/glue.js.svg)](https://nodejs.org)
[![npm downloads](https://img.shields.io/npm/dm/glue.js.svg)](https://www.npmjs.com/package/glue.js)

> 🎉 **NEW in v0.6.0:** Natural JavaScript syntax! No more `.set()` and `.get()` - just write normal JavaScript and watch the magic happen. **[See what's new →](#-modern-javascript-syntax)**

# Make your data reactive like magic ✨

**What if changing one value in your JavaScript object automatically updated everything that depends on it?**

Like Excel, but for your app's data. No frameworks, no build tools, no configuration. Just **reactive magic**.

```javascript
// Your shopping cart updates itself automatically
const cart = new Glue({ items: [], total: 0 });

// When items change, total recalculates instantly
cart.addObserver('items', () => {
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
});

cart.items.push({ name: 'Coffee', price: 5 });
console.log(cart.total); // 5 - calculated automatically!
```

**That's it.** Just **normal JavaScript**. No `.set()`, no `.push()`, no learning curve. Just reactive data that works like magic.

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
cart.items.push({ name: 'iPhone', price: 999 });
// ✨ Subtotal, tax, and total all update instantly
```

## 🔥 Perfect for...

### **Form Validation That Actually Works**
```javascript
const form = new Glue({ email: '', password: '', errors: {} });

form.addObserver('email', () => {
  if (!form.email.includes('@')) {
    form.errors.email = 'Please enter a valid email';
  } else {
    delete form.errors.email;
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
  dashboard.activeUsers = dashboard.users.filter(u => u.active).length;
  dashboard.revenue = dashboard.users.reduce((sum, u) => sum + u.spent, 0);
  dashboard.conversionRate = dashboard.activeUsers / dashboard.users.length;
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
  const sorted = game.players.sort((a, b) => b.score - a.score);
  game.topPlayer = sorted[0];
  game.averageScore = game.players.reduce((sum, p) => sum + p.score, 0) / game.players.length;
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
  data.doubled = data.count * 2;
});

data.count = 5;
console.log(data.doubled); // 10 ✨
```

**That's literally it.** No webpack, no babel, no configuration. Just reactive data.

## 🔥 Modern JavaScript Syntax

glue.js now uses **natural JavaScript syntax** that feels like native language features:

```javascript
// ✨ Modern (v0.6.0+): Just write normal JavaScript
const data = new Glue({ user: { name: 'Alice', age: 25 } });

data.user.name = 'Bob';        // ← Triggers observers automatically
data.user.age += 1;            // ← So does this
data.items.push(newItem);      // ← And this
delete data.user.oldProp;      // ← Even this!
```

```javascript
// 📜 Legacy (still works): Traditional API  
data.set('user.name', 'Bob');
data.set('user.age', data.get('user.age') + 1);
data.push('items', newItem);
data.remove('user.oldProp');
```

**How it works:** glue.js automatically detects modern JavaScript environments and uses [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to intercept property changes. In older environments, it gracefully falls back to traditional methods.

**Best part:** Your code is **100% backward compatible**. Existing apps keep working, but you can start using the natural syntax immediately.

### The Transformation 
**Before v0.6.0** - Had to use manipulator functions:
```javascript
dashboard.set('activeUsers', users.filter(u => u.active).length);
dashboard.set('revenue', calculateRevenue(dashboard.get('users')));
```

**After v0.6.0** - Just write JavaScript:
```javascript  
dashboard.activeUsers = users.filter(u => u.active).length;
dashboard.revenue = calculateRevenue(dashboard.users);
```

Same powerful reactivity, zero learning curve. 🎯

## 🎯 Why glue.js wins

- **🎯 Natural JavaScript syntax** - Just `obj.prop = value`, no learning curve
- **🔄 Automatic fallback** - Uses modern Proxies when available, traditional methods otherwise  
- **📦 Zero dependencies** - No bloat, no security vulnerabilities, no version conflicts
- **⚡ Tiny footprint** - Less than 10KB, works everywhere (even IE11)
- **🛠️ Zero configuration** - No build tools, no setup, no framework lock-in
- **🧠 Actually simple** - If you understand `addEventListener`, you understand glue.js
- **🏭 Production proven** - Running in production apps for over a decade

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