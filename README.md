# glue.js

[![CI](https://github.com/felixflores/glue.js/actions/workflows/ci.yml/badge.svg)](https://github.com/felixflores/glue.js/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@felixflores%2Fglue.js.svg)](https://badge.fury.io/js/@felixflores%2Fglue.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://codecov.io/gh/felixflores/glue.js/branch/master/graph/badge.svg)](https://codecov.io/gh/felixflores/glue.js)
[![Node.js Version](https://img.shields.io/node/v/glue.js.svg)](https://nodejs.org)
[![npm downloads](https://img.shields.io/npm/dm/@felixflores/glue.js.svg)](https://www.npmjs.com/package/@felixflores/glue.js)

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

### **Deep Object Observation** 🤯
Watch nested properties, array changes, even calculated values:

```javascript
const dashboard = new Glue({ 
  company: {
    users: [
      { name: 'Alice', profile: { active: true, tier: 'premium' }, spending: { total: 1200 } },
      { name: 'Bob', profile: { active: false, tier: 'basic' }, spending: { total: 450 } }
    ],
    metrics: {
      activeUsers: 0,
      premiumUsers: 0,
      revenue: 0,
      averageSpend: 0
    }
  }
});

// Watch deep nested changes - this is the magic! ✨
dashboard.addObserver('company.users', () => {
  console.log('Users array changed!');
  updateMetrics();
});

// Watch individual user properties
dashboard.addObserver('company.users[0].profile.active', updateMetrics);
dashboard.addObserver('company.users[1].profile.active', updateMetrics);
dashboard.addObserver('company.users[0].spending.total', updateMetrics);
dashboard.addObserver('company.users[1].spending.total', updateMetrics);

// Or use generic array observation (watches ALL array elements)
dashboard.addObserver('company.users[]', updateMetrics);

// Watch calculated values change automatically
dashboard.addObserver('company.metrics.activeUsers', () => {
  dashboard.company.metrics.averageSpend = 
    dashboard.company.metrics.revenue / dashboard.company.metrics.activeUsers;
});

function updateMetrics() {
  const users = dashboard.company.users;
  dashboard.company.metrics.activeUsers = users.filter(u => u.profile.active).length;
  dashboard.company.metrics.premiumUsers = users.filter(u => u.profile.tier === 'premium').length;
  dashboard.company.metrics.revenue = users.reduce((sum, u) => sum + u.spending.total, 0);
}

// Now watch the cascade! Change one deep value, everything updates:
dashboard.company.users[0].profile.active = false;
// → User activation observer fires
// → updateMetrics() runs 
// → activeUsers changes
// → averageSpend observer fires
// → averageSpend recalculates automatically

// Even array operations trigger deep observation:
dashboard.company.users.push({ 
  name: 'Charlie', 
  profile: { active: true, tier: 'premium' }, 
  spending: { total: 2000 } 
});
// → All metrics recalculate automatically!
```

### **Calculated Values & Dependency Chains** 🔥
This is where glue.js gets truly magical - watch calculated values change other calculated values:

```javascript
const ecommerce = new Glue({
  cart: {
    items: [
      { name: 'Widget', price: 9.99, quantity: 2 },
      { name: 'Gadget', price: 15.50, quantity: 1 }
    ]
  },
  pricing: {
    subtotal: 0,
    discountPercent: 0.1,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0
  }
});

// Set up the calculation cascade  
ecommerce.addObserver('cart.items', updateSubtotal);
ecommerce.addObserver('cart.items[]', updateSubtotal); // Watch any array element changes!

ecommerce.addObserver('pricing.subtotal', updateDiscount);
ecommerce.addObserver('pricing.discountPercent', updateDiscount);

ecommerce.addObserver('pricing.subtotal', updateShipping);
ecommerce.addObserver('pricing.discount', updateShipping);

ecommerce.addObserver('pricing.subtotal', updateTax);
ecommerce.addObserver('pricing.discount', updateTax);

// Watch ALL the calculated values to update total
ecommerce.addObserver('pricing.subtotal', updateTotal);
ecommerce.addObserver('pricing.discount', updateTotal);
ecommerce.addObserver('pricing.tax', updateTotal);
ecommerce.addObserver('pricing.shipping', updateTotal);

function updateSubtotal() {
  ecommerce.pricing.subtotal = ecommerce.cart.items
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateDiscount() {
  ecommerce.pricing.discount = ecommerce.pricing.subtotal * ecommerce.pricing.discountPercent;
}

function updateShipping() {
  const afterDiscount = ecommerce.pricing.subtotal - ecommerce.pricing.discount;
  ecommerce.pricing.shipping = afterDiscount > 50 ? 0 : 5.99;
}

function updateTax() {
  const taxable = ecommerce.pricing.subtotal - ecommerce.pricing.discount;
  ecommerce.pricing.tax = taxable * 0.08;
}

function updateTotal() {
  ecommerce.pricing.total = ecommerce.pricing.subtotal 
    - ecommerce.pricing.discount 
    + ecommerce.pricing.shipping 
    + ecommerce.pricing.tax;
}

// Initialize
updateSubtotal();

// Now watch the magic! One small change cascades through everything:
ecommerce.cart.items[0].quantity = 3;
// → subtotal changes (9.99 * 3 + 15.50 = 45.47)
// → discount changes (45.47 * 0.1 = 4.55)  
// → shipping changes (40.92 < 50, so shipping = 5.99)
// → tax changes ((45.47 - 4.55) * 0.08 = 3.27)
// → total changes (45.47 - 4.55 + 5.99 + 3.27 = 50.18)
// All automatically! 🤯

// Even changing discount percent cascades everything:
ecommerce.pricing.discountPercent = 0.15;
// → discount recalculates
// → shipping recalculates  
// → tax recalculates
// → total recalculates
// Like a spreadsheet, but in JavaScript!
```

## 🤯 Why This Is Revolutionary

**Most libraries make you manage dependencies manually:**
```javascript
// Redux/MobX style: You have to remember what depends on what
function updateCart() {
  updateSubtotal();    // Did you remember this?
  updateDiscount();    // What about this?  
  updateShipping();    // And this?
  updateTax();         // Easy to forget!
  updateTotal();       // Order matters!
}
```

**glue.js makes dependencies self-managing:**
```javascript
// Just declare what depends on what, then forget about it
ecommerce.addObserver('pricing.subtotal', updateDiscount);
ecommerce.addObserver('pricing.subtotal', updateShipping);
ecommerce.addObserver('pricing.subtotal', updateTax);

// Now ANY change to subtotal automatically updates everything
// No manual coordination, no forgetting dependencies, no bugs! 🎯
```

**The result?** Your code becomes **self-healing**. Add new calculated values, change existing ones, refactor business logic - the dependency graph automatically stays correct.

## 🚀 Get Started (30 seconds)

```bash
npm install @felixflores/glue.js
```

```javascript
const Glue = require('@felixflores/glue.js');

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
- **Complex calculated values** - Spreadsheet-like dependency chains
- **Deep object observation** - Watch nested properties and array changes  
- **Real-time dashboards** - Metrics that depend on other metrics
- **E-commerce pricing** - Discounts, tax, shipping calculations
- **Form validation** - Field interdependencies and business rules
- **Game state management** - Scores, levels, achievements that cascade
- **Financial applications** - Interest, fees, balances that auto-update
- **Data visualization** - Charts that respond to deep data changes
- **Any time you think "this is like Excel"** - That's exactly what glue.js does!

**Maybe overkill for:**
- Static websites with no interactivity
- Simple CRUD with no calculated fields  
- Hello world apps
- One-off scripts that don't need reactivity

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