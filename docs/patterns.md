# Advanced Patterns and Best Practices

## Reactive Calculated Values

The most powerful feature of glue.js is creating calculated values that automatically update when their dependencies change.

### Basic Pattern

```javascript
const model = new Glue({
  firstName: 'John',
  lastName: 'Doe',
  fullName: '' // calculated
});

// Set up the calculation
model.addObserver('firstName', updateFullName);
model.addObserver('lastName', updateFullName);

function updateFullName() {
  const first = model.get('firstName');
  const last = model.get('lastName');
  model.set('fullName', `${first} ${last}`);
}

// Initial calculation
updateFullName();
```

### Complex Dependency Chains

Create cascading calculations where one computed value depends on another:

```javascript
const cart = new Glue({
  items: [
    { name: 'Widget', price: 9.99, quantity: 2 },
    { name: 'Gadget', price: 15.50, quantity: 1 }
  ],
  subtotal: 0,    // sum of item totals
  discount: 0,    // based on subtotal
  tax: 0,         // based on subtotal after discount
  shipping: 0,    // based on subtotal after discount
  total: 0        // final total
});

// Level 1: Calculate subtotal from items
cart.addObserver('items', () => {
  const items = cart.get('items');
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.set('subtotal', Math.round(subtotal * 100) / 100);
});

// Level 2: Calculate discount based on subtotal
cart.addObserver('subtotal', () => {
  const subtotal = cart.get('subtotal');
  const discount = subtotal > 100 ? subtotal * 0.1 : 0;
  cart.set('discount', Math.round(discount * 100) / 100);
});

// Level 3: Calculate tax based on discounted amount
cart.addObserver('subtotal', updateTax);
cart.addObserver('discount', updateTax);

function updateTax() {
  const subtotal = cart.get('subtotal');
  const discount = cart.get('discount');
  const taxable = subtotal - discount;
  cart.set('tax', Math.round(taxable * 0.08 * 100) / 100);
}

// Level 3: Calculate shipping based on discounted amount
cart.addObserver('subtotal', updateShipping);
cart.addObserver('discount', updateShipping);

function updateShipping() {
  const subtotal = cart.get('subtotal');
  const discount = cart.get('discount');
  const afterDiscount = subtotal - discount;
  cart.set('shipping', afterDiscount > 50 ? 0 : 5.99);
}

// Level 4: Calculate final total
cart.addObserver('subtotal', updateTotal);
cart.addObserver('discount', updateTotal);
cart.addObserver('tax', updateTotal);
cart.addObserver('shipping', updateTotal);

function updateTotal() {
  const subtotal = cart.get('subtotal');
  const discount = cart.get('discount');
  const tax = cart.get('tax');
  const shipping = cart.get('shipping');
  const total = subtotal - discount + tax + shipping;
  cart.set('total', Math.round(total * 100) / 100);
}
```

## Form Validation Patterns

### Real-time Validation

```javascript
const form = new Glue({
  fields: {
    email: '',
    password: '',
    confirmPassword: ''
  },
  errors: {},
  isValid: false
});

// Email validation
form.addObserver('fields.email', () => {
  const email = form.get('fields.email');
  if (!email) {
    form.set('errors.email', 'Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.set('errors.email', 'Please enter a valid email address');
  } else {
    form.remove('errors.email');
  }
  updateFormValidity();
});

// Password validation
form.addObserver('fields.password', () => {
  const password = form.get('fields.password');
  if (!password) {
    form.set('errors.password', 'Password is required');
  } else if (password.length < 8) {
    form.set('errors.password', 'Password must be at least 8 characters');
  } else {
    form.remove('errors.password');
  }
  validatePasswordMatch();
  updateFormValidity();
});

// Password confirmation
form.addObserver('fields.confirmPassword', validatePasswordMatch);

function validatePasswordMatch() {
  const password = form.get('fields.password');
  const confirm = form.get('fields.confirmPassword');
  
  if (confirm && password !== confirm) {
    form.set('errors.confirmPassword', 'Passwords do not match');
  } else {
    form.remove('errors.confirmPassword');
  }
  updateFormValidity();
}

// Overall form validity
function updateFormValidity() {
  const errors = form.get('errors');
  const hasErrors = Object.keys(errors).length > 0;
  const email = form.get('fields.email');
  const password = form.get('fields.password');
  const confirm = form.get('fields.confirmPassword');
  
  const allFieldsFilled = email && password && confirm;
  form.set('isValid', allFieldsFilled && !hasErrors);
}
```

### Dependent Field Validation

```javascript
const addressForm = new Glue({
  country: '',
  state: '',
  zipCode: '',
  errors: {}
});

// Country-dependent state validation
addressForm.addObserver('country', () => {
  const country = addressForm.get('country');
  
  if (country === 'US' || country === 'CA') {
    // State required for US/Canada
    const state = addressForm.get('state');
    if (!state) {
      addressForm.set('errors.state', 'State is required');
    } else {
      addressForm.remove('errors.state');
    }
  } else {
    // State optional for other countries
    addressForm.remove('errors.state');
  }
});

// State-dependent zip code validation
addressForm.addObserver('state', validateZipCode);
addressForm.addObserver('zipCode', validateZipCode);

function validateZipCode() {
  const country = addressForm.get('country');
  const zipCode = addressForm.get('zipCode');
  
  if (country === 'US' && zipCode) {
    if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
      addressForm.set('errors.zipCode', 'Please enter a valid US ZIP code');
    } else {
      addressForm.remove('errors.zipCode');
    }
  } else if (country === 'CA' && zipCode) {
    if (!/^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(zipCode)) {
      addressForm.set('errors.zipCode', 'Please enter a valid Canadian postal code');
    } else {
      addressForm.remove('errors.zipCode');
    }
  } else {
    addressForm.remove('errors.zipCode');
  }
}
```

## Dashboard and Analytics Patterns

### Real-time Metrics Dashboard

```javascript
const dashboard = new Glue({
  users: [],
  
  // Calculated metrics
  totalUsers: 0,
  activeUsers: 0,
  premiumUsers: 0,
  
  // Percentages
  activePercentage: 0,
  premiumPercentage: 0,
  
  // Revenue metrics
  totalRevenue: 0,
  averageRevenuePerUser: 0,
  
  // Engagement metrics
  averageSessionTime: 0,
  topEngagementUser: null
});

// Update all metrics when users change
dashboard.addObserver('users', updateMetrics);

function updateMetrics() {
  const users = dashboard.get('users');
  
  // Basic counts
  dashboard.set('totalUsers', users.length);
  dashboard.set('activeUsers', users.filter(u => u.isActive).length);
  dashboard.set('premiumUsers', users.filter(u => u.isPremium).length);
  
  // Percentages
  const total = users.length;
  const active = dashboard.get('activeUsers');
  const premium = dashboard.get('premiumUsers');
  
  dashboard.set('activePercentage', total ? Math.round(active / total * 100) : 0);
  dashboard.set('premiumPercentage', total ? Math.round(premium / total * 100) : 0);
  
  // Revenue
  const totalRevenue = users.reduce((sum, u) => sum + (u.monthlySpend || 0), 0);
  dashboard.set('totalRevenue', totalRevenue);
  dashboard.set('averageRevenuePerUser', total ? totalRevenue / total : 0);
  
  // Engagement
  const avgSession = users.reduce((sum, u) => sum + (u.avgSessionMinutes || 0), 0) / total;
  dashboard.set('averageSessionTime', total ? avgSession : 0);
  
  // Top user
  const topUser = users.reduce((top, user) => {
    return (user.avgSessionMinutes || 0) > (top?.avgSessionMinutes || 0) ? user : top;
  }, null);
  dashboard.set('topEngagementUser', topUser);
}

// Real-time updates
function addUser(userData) {
  const users = dashboard.get('users');
  users.push(userData);
  dashboard.set('users', users); // Triggers all metric updates
}

function updateUser(userId, updates) {
  const users = dashboard.get('users');
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    Object.assign(users[userIndex], updates);
    dashboard.set('users', users); // Triggers all metric updates
  }
}
```

## Game State Patterns

### Leaderboard with Live Rankings

```javascript
const game = new Glue({
  players: [],
  leaderboard: [],
  topPlayer: null,
  averageScore: 0,
  totalGames: 0,
  playerStats: {}
});

// Update leaderboard when players change
game.addObserver('players', updateLeaderboard);

function updateLeaderboard() {
  const players = game.get('players');
  
  // Sort by score descending
  const sorted = [...players].sort((a, b) => b.score - a.score);
  
  // Add rankings
  const leaderboard = sorted.map((player, index) => ({
    ...player,
    rank: index + 1,
    badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
  }));
  
  game.set('leaderboard', leaderboard);
  game.set('topPlayer', sorted[0] || null);
  
  // Calculate stats
  const totalScore = players.reduce((sum, p) => sum + p.score, 0);
  game.set('averageScore', players.length ? totalScore / players.length : 0);
  
  const totalGames = players.reduce((sum, p) => sum + p.gamesPlayed, 0);
  game.set('totalGames', totalGames);
  
  // Individual player stats
  const stats = {};
  players.forEach(player => {
    stats[player.id] = {
      rank: leaderboard.find(p => p.id === player.id)?.rank || 0,
      percentile: Math.round((1 - (leaderboard.findIndex(p => p.id === player.id) / players.length)) * 100),
      aboveAverage: player.score > game.get('averageScore')
    };
  });
  game.set('playerStats', stats);
}

// Game actions
function updatePlayerScore(playerId, newScore) {
  const players = game.get('players');
  const player = players.find(p => p.id === playerId);
  if (player) {
    player.score = newScore;
    player.lastUpdated = new Date();
    game.set('players', players); // Triggers leaderboard update
  }
}

function addPlayer(playerData) {
  const players = game.get('players');
  players.push({
    ...playerData,
    score: 0,
    gamesPlayed: 0,
    joinedAt: new Date()
  });
  game.set('players', players);
}
```

## Data Synchronization Patterns

### Auto-save with Debouncing

```javascript
const document = new Glue({
  title: '',
  content: '',
  lastSaved: null,
  isDirty: false,
  isSaving: false
});

// Debounced save function
const debouncedSave = debounce(saveDocument, 2000);

// Mark as dirty when content changes
document.addObserver('title', markDirty);
document.addObserver('content', markDirty);

function markDirty() {
  document.set('isDirty', true);
  debouncedSave();
}

async function saveDocument() {
  if (!document.get('isDirty')) return;
  
  document.set('isSaving', true);
  
  try {
    const response = await fetch('/api/documents/123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: document.get('title'),
        content: document.get('content')
      })
    });
    
    if (response.ok) {
      document.set('isDirty', false);
      document.set('lastSaved', new Date());
    }
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    document.set('isSaving', false);
  }
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

### Conflict Resolution

```javascript
const collaborativeDoc = new Glue({
  localVersion: 0,
  serverVersion: 0,
  content: '',
  conflicts: [],
  isConflicted: false
});

// Check for conflicts when server version changes
collaborativeDoc.addObserver('serverVersion', checkForConflicts);

function checkForConflicts() {
  const localVersion = collaborativeDoc.get('localVersion');
  const serverVersion = collaborativeDoc.get('serverVersion');
  const hasConflicts = collaborativeDoc.get('conflicts').length > 0;
  
  collaborativeDoc.set('isConflicted', localVersion !== serverVersion || hasConflicts);
}

// Handle incoming server updates
function handleServerUpdate(serverData) {
  const localVersion = collaborativeDoc.get('localVersion');
  
  if (serverData.version <= localVersion) {
    // Our version is newer or same, ignore
    return;
  }
  
  if (localVersion === serverData.baseVersion) {
    // No conflict, apply server changes
    collaborativeDoc.set('content', serverData.content);
    collaborativeDoc.set('serverVersion', serverData.version);
    collaborativeDoc.set('localVersion', serverData.version);
  } else {
    // Conflict detected
    const conflicts = collaborativeDoc.get('conflicts');
    conflicts.push({
      type: 'content_conflict',
      localContent: collaborativeDoc.get('content'),
      serverContent: serverData.content,
      timestamp: new Date()
    });
    collaborativeDoc.set('conflicts', conflicts);
    collaborativeDoc.set('serverVersion', serverData.version);
  }
}
```

## Performance Optimization Patterns

### Batch Updates

```javascript
const heavyComputation = new Glue({
  inputs: {
    a: 0, b: 0, c: 0, d: 0, e: 0
  },
  result: 0
});

let updatePending = false;

// Batch multiple input changes into single computation
['a', 'b', 'c', 'd', 'e'].forEach(key => {
  heavyComputation.addObserver(`inputs.${key}`, scheduleUpdate);
});

function scheduleUpdate() {
  if (updatePending) return;
  
  updatePending = true;
  requestAnimationFrame(() => {
    updatePending = false;
    computeResult();
  });
}

function computeResult() {
  const inputs = heavyComputation.get('inputs');
  
  // Expensive calculation
  const result = Object.values(inputs).reduce((sum, val) => {
    return sum + Math.pow(val, 2) * Math.random();
  }, 0);
  
  heavyComputation.set('result', result);
}

// Usage: Multiple rapid changes only trigger one computation
heavyComputation.set('inputs.a', 10);
heavyComputation.set('inputs.b', 20);
heavyComputation.set('inputs.c', 30); // Only this triggers actual computation
```

### Selective Updates

```javascript
const largeDataset = new Glue({
  items: [], // Large array
  visibleItems: [], // Filtered subset
  filter: '',
  sortBy: 'name',
  page: 0,
  pageSize: 50
});

// Only update visible items when relevant properties change
largeDataset.addObserver('items', updateVisibleItems);
largeDataset.addObserver('filter', updateVisibleItems);
largeDataset.addObserver('sortBy', updateVisibleItems);
largeDataset.addObserver('page', updateVisibleItems);

function updateVisibleItems() {
  const items = largeDataset.get('items');
  const filter = largeDataset.get('filter');
  const sortBy = largeDataset.get('sortBy');
  const page = largeDataset.get('page');
  const pageSize = largeDataset.get('pageSize');
  
  // Filter
  let filtered = items;
  if (filter) {
    filtered = items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }
  
  // Sort
  filtered.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });
  
  // Paginate
  const start = page * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  
  largeDataset.set('visibleItems', visible);
}
```

## Memory Management

### Cleanup Patterns

```javascript
class ComponentManager {
  constructor() {
    this.components = new Map();
  }
  
  createComponent(id, data) {
    const glue = new Glue(data);
    
    // Store reference for cleanup
    this.components.set(id, glue);
    
    return glue;
  }
  
  destroyComponent(id) {
    const glue = this.components.get(id);
    if (glue) {
      glue.destroy(); // Clean up all observers
      this.components.delete(id);
    }
  }
  
  destroyAll() {
    this.components.forEach(glue => glue.destroy());
    this.components.clear();
  }
}

// Usage
const manager = new ComponentManager();
const userProfile = manager.createComponent('user-profile', { name: '', email: '' });

// Later...
manager.destroyComponent('user-profile'); // Prevents memory leaks
```

## Testing Patterns

### Observer Testing

```javascript
// Test helper for counting observer calls
function createObserverSpy() {
  const calls = [];
  const spy = (message) => calls.push(message);
  spy.calls = calls;
  spy.callCount = () => calls.length;
  spy.lastCall = () => calls[calls.length - 1];
  spy.reset = () => calls.length = 0;
  return spy;
}

// Example test
function testCalculatedValues() {
  const model = new Glue({ a: 1, b: 2, sum: 0 });
  const spy = createObserverSpy();
  
  model.addObserver('sum', spy);
  
  // Set up calculation
  model.addObserver('a', updateSum);
  model.addObserver('b', updateSum);
  
  function updateSum() {
    model.set('sum', model.get('a') + model.get('b'));
  }
  
  // Test
  updateSum(); // Initial calculation
  console.assert(model.get('sum') === 3, 'Initial sum incorrect');
  console.assert(spy.callCount() === 1, 'Observer not called');
  
  model.set('a', 5);
  console.assert(model.get('sum') === 7, 'Updated sum incorrect');
  console.assert(spy.callCount() === 2, 'Observer not called on update');
}
```

These patterns show how glue.js can handle complex, real-world scenarios while maintaining clean, readable code. The key is to think in terms of reactive data flows rather than imperative updates.