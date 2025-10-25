import { setTimeout } from 'timers/promises';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  error?: string;
  duration?: number;
}

interface TestContext {
  accessToken?: string;
  refreshToken?: string;
  tenantId?: number;
  userId?: number;
  testData: Map<string, any>;
}

const results: TestResult[] = [];
const ctx: TestContext = { testData: new Map() };

async function makeRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data?: any; error?: string }> {
  const startTime = Date.now();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (ctx.accessToken) {
    defaultHeaders['Authorization'] = `Bearer ${ctx.accessToken}`;
  }
  if (ctx.tenantId) {
    defaultHeaders['X-Tenant-Id'] = String(ctx.tenantId);
  }
  if (ctx.userId) {
    defaultHeaders['X-User-Id'] = String(ctx.userId);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

    const duration = Date.now() - startTime;
    let data;
    
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    return { status: response.status, data, error: undefined };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return { status: 0, error: error.message };
  }
}

function logTest(endpoint: string, method: string, status: 'PASS' | 'FAIL' | 'SKIP', statusCode?: number, error?: string) {
  const result: TestResult = { endpoint, method, status, statusCode, error };
  results.push(result);
  
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  const statusText = statusCode ? ` [${statusCode}]` : '';
  const errorText = error ? ` - ${error}` : '';
  console.log(`${emoji} ${method} ${endpoint}${statusText}${errorText}`);
}

async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  expectedStatus: number | number[] = 200,
  body?: any,
  headers?: Record<string, string>
): Promise<any> {
  const result = await makeRequest(endpoint, method, body, headers);
  const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  
  if (result.status === 0) {
    logTest(endpoint, method, 'FAIL', 0, result.error);
    return null;
  }
  
  if (expected.includes(result.status)) {
    logTest(endpoint, method, 'PASS', result.status);
    return result.data;
  } else {
    logTest(endpoint, method, 'FAIL', result.status, result.data?.error || 'Unexpected status');
    return null;
  }
}

console.log('\n🚀 Starting Comprehensive API Endpoint Testing\n');
console.log('='.repeat(60));

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================
console.log('\n📋 Category: Authentication\n');

// Test health endpoint (public)
await testEndpoint('/api/health', 'GET', 200);

// Register a new user
const timestamp = Date.now();
const registerData = {
  username: `testuser${timestamp}`,
  email: `test${timestamp}@example.com`,
  password: 'Test123456!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890'
};

const registerResult = await testEndpoint('/api/auth/register', 'POST', [200, 201], registerData);
if (registerResult) {
  ctx.accessToken = registerResult.accessToken;
  ctx.refreshToken = registerResult.refreshToken;
  ctx.userId = registerResult.user?.id;
  ctx.tenantId = registerResult.user?.tenantId;
  console.log(`   ℹ️  Registered user: ${registerResult.user?.email} (Tenant: ${ctx.tenantId})`);
}

// Test login
if (ctx.accessToken) {
  const loginResult = await testEndpoint('/api/auth/login', 'POST', 200, {
    email: registerData.email,
    password: registerData.password
  });
  if (loginResult) {
    ctx.accessToken = loginResult.accessToken;
    console.log(`   ℹ️  Logged in successfully`);
  }
}

// Test token refresh
if (ctx.refreshToken) {
  const refreshResult = await testEndpoint('/api/auth/refresh', 'POST', 200, {
    refreshToken: ctx.refreshToken
  });
  if (refreshResult?.accessToken) {
    ctx.accessToken = refreshResult.accessToken;
    console.log(`   ℹ️  Token refreshed successfully`);
  }
}

// Test /api/auth/me endpoint
await testEndpoint('/api/auth/me', 'GET', 200);

// ============================================================================
// TENANT TESTS
// ============================================================================
console.log('\n📋 Category: Tenant Management\n');

await testEndpoint('/api/tenants', 'GET', 200);

// ============================================================================
// CRM MODULE TESTS
// ============================================================================
console.log('\n📋 Category: CRM - Health & Stats\n');

await testEndpoint('/api/health', 'GET', 200);
await testEndpoint('/api/stats', 'GET', [200, 404]);

// ============================================================================
console.log('\n📋 Category: CRM - Contacts\n');

const contactData = {
  firstName: 'John',
  lastName: 'Doe',
  email: `john.doe.${timestamp}@example.com`,
  phone: '+1234567890',
  company: 'Test Corp'
};

const contact = await testEndpoint('/api/contacts', 'POST', [200, 201], contactData);
if (contact?.id) {
  ctx.testData.set('contactId', contact.id);
  await testEndpoint('/api/contacts', 'GET', 200);
  await testEndpoint(`/api/contacts/${contact.id}`, 'GET', 200);
  await testEndpoint(`/api/contacts/${contact.id}`, 'PUT', 200, { phone: '+9876543210' });
}

// ============================================================================
console.log('\n📋 Category: CRM - Companies\n');

const companyData = {
  name: `Test Company ${timestamp}`,
  industry: 'Technology',
  website: 'https://example.com',
  email: `company${timestamp}@example.com`
};

const company = await testEndpoint('/api/companies', 'POST', [200, 201], companyData);
if (company?.id) {
  ctx.testData.set('companyId', company.id);
  await testEndpoint('/api/companies', 'GET', 200);
  await testEndpoint(`/api/companies/${company.id}`, 'GET', 200);
  await testEndpoint(`/api/companies/${company.id}`, 'PUT', 200, { website: 'https://updated.com' });
}

// ============================================================================
console.log('\n📋 Category: CRM - Pipelines\n');

const pipelineData = {
  pipeline: {
    title: `Sales Pipeline ${timestamp}`,
    description: 'Test pipeline'
  },
  stages: [
    { title: 'Prospecting', order: 1 },
    { title: 'Qualification', order: 2 },
    { title: 'Proposal', order: 3 }
  ]
};

const pipeline = await testEndpoint('/api/pipelines', 'POST', [200, 201], pipelineData);
if (pipeline?.id) {
  ctx.testData.set('pipelineId', pipeline.id);
  await testEndpoint('/api/pipelines', 'GET', 200);
  await testEndpoint(`/api/pipelines/${pipeline.id}`, 'GET', 200);
  await testEndpoint(`/api/pipelines/${pipeline.id}/stages`, 'GET', 200);
  await testEndpoint(`/api/pipelines/${pipeline.id}`, 'PUT', 200, { description: 'Updated pipeline' });
}

// ============================================================================
console.log('\n📋 Category: CRM - Sales Stages\n');

await testEndpoint('/api/sales-stages', 'GET', 200);

// ============================================================================
console.log('\n📋 Category: CRM - Deals\n');

const dealData = {
  title: `Deal ${timestamp}`,
  value: 10000,
  contactId: ctx.testData.get('contactId'),
  companyId: ctx.testData.get('companyId')
};

const deal = await testEndpoint('/api/deals', 'POST', [200, 201], dealData);
if (deal?.id) {
  ctx.testData.set('dealId', deal.id);
  await testEndpoint('/api/deals', 'GET', 200);
  await testEndpoint(`/api/deals/${deal.id}`, 'GET', 200);
  await testEndpoint(`/api/deals/${deal.id}`, 'PUT', 200, { value: 15000 });
}

// ============================================================================
console.log('\n📋 Category: CRM - Activities\n');

const activityData = {
  type: 'meeting',
  subject: `Meeting ${timestamp}`,
  description: 'Test meeting',
  userId: ctx.userId || 1,
  scheduledAt: new Date().toISOString(),
  contactId: ctx.testData.get('contactId')
};

const activity = await testEndpoint('/api/activities', 'POST', [200, 201], activityData);
if (activity?.id) {
  ctx.testData.set('activityId', activity.id);
  await testEndpoint('/api/activities', 'GET', 200);
  await testEndpoint(`/api/activities/${activity.id}`, 'GET', 200);
  await testEndpoint(`/api/activities/${activity.id}`, 'PUT', 200, { description: 'Updated meeting' });
}

// ============================================================================
console.log('\n📋 Category: CRM - Products\n');

const productData = {
  name: `Product ${timestamp}`,
  title: `Product ${timestamp}`,
  sku: `SKU-${timestamp}`,
  salePrice: 99.99,
  description: 'Test product'
};

const product = await testEndpoint('/api/products', 'POST', [200, 201], productData);
if (product?.id) {
  ctx.testData.set('productId', product.id);
  await testEndpoint('/api/products', 'GET', 200);
  await testEndpoint(`/api/products/${product.id}`, 'GET', 200);
  await testEndpoint(`/api/products/${product.id}`, 'PUT', 200, { salePrice: 89.99 });
}

// ============================================================================
console.log('\n📋 Category: CRM - Product Categories\n');

await testEndpoint('/api/product-categories', 'GET', 200);
const productCategory = await testEndpoint('/api/product-categories', 'POST', [200, 201], {
  name: `Category ${timestamp}`,
  description: 'Test category'
});

// ============================================================================
console.log('\n📋 Category: CRM - Product Variations\n');

await testEndpoint('/api/product-variations', 'GET', 200);

// ============================================================================
console.log('\n📋 Category: CRM - Product Offers\n');

await testEndpoint('/api/product-offers', 'GET', 200);

// ============================================================================
console.log('\n📋 Category: CRM - Setup Data (Activity Types, Customer Types, etc.)\n');

await testEndpoint('/api/activity-types', 'GET', 200);
await testEndpoint('/api/customer-types', 'GET', 200);
await testEndpoint('/api/meeting-types', 'GET', 200);
await testEndpoint('/api/cancellation-reasons', 'GET', 200);
await testEndpoint('/api/payment-methods', 'GET', 200);
await testEndpoint('/api/payment-items', 'GET', 200);
await testEndpoint('/api/interest-levels', 'GET', 200);
await testEndpoint('/api/lead-sources', 'GET', 200);

// ============================================================================
console.log('\n📋 Category: CRM - Payments\n');

await testEndpoint('/api/payments', 'GET', 200);
const payment = await testEndpoint('/api/payments', 'POST', [200, 201], {
  amount: 1000,
  paymentDate: new Date(),
  paymentMethodId: 1,
  contactId: ctx.testData.get('contactId')
});

// ============================================================================
console.log('\n📋 Category: CRM - Commissions\n');

await testEndpoint('/api/commissions/statuses', 'GET', 200);
await testEndpoint('/api/commissions', 'GET', 200);

// ============================================================================
console.log('\n📋 Category: CRM - Users\n');

await testEndpoint('/api/users', 'GET', 200);
if (ctx.userId) {
  await testEndpoint(`/api/users/${ctx.userId}`, 'GET', [200, 404]);
}

// ============================================================================
// FINANCE MODULE TESTS (if route is registered)
// ============================================================================
console.log('\n📋 Category: Finance Module\n');

await testEndpoint('/api/finance/health', 'GET', [200, 404]);
await testEndpoint('/api/finance/stats', 'GET', [200, 404]);
await testEndpoint('/api/finance/customers', 'GET', [200, 404]);
await testEndpoint('/api/finance/vendors', 'GET', [200, 404]);
await testEndpoint('/api/finance/invoices', 'GET', [200, 404]);
await testEndpoint('/api/finance/expenses', 'GET', [200, 404]);
await testEndpoint('/api/finance/expense-categories', 'GET', [200, 404]);
await testEndpoint('/api/finance/accounts', 'GET', [200, 404]);
await testEndpoint('/api/finance/account-categories', 'GET', [200, 404]);
await testEndpoint('/api/finance/budgets', 'GET', [200, 404]);
await testEndpoint('/api/finance/transactions', 'GET', [200, 404]);
await testEndpoint('/api/finance/payments', 'GET', [200, 404]);

// ============================================================================
// HR MODULE TESTS (if route is registered)
// ============================================================================
console.log('\n📋 Category: HR Module\n');

await testEndpoint('/api/hr/health', 'GET', [200, 404]);
await testEndpoint('/api/hr/stats', 'GET', [200, 404]);
await testEndpoint('/api/hr/departments', 'GET', [200, 404]);
await testEndpoint('/api/hr/positions', 'GET', [200, 404]);
await testEndpoint('/api/hr/employees', 'GET', [200, 404]);
await testEndpoint('/api/hr/leave-requests', 'GET', [200, 404]);
await testEndpoint('/api/hr/performance-reviews', 'GET', [200, 404]);
await testEndpoint('/api/hr/attendance', 'GET', [200, 404]);
await testEndpoint('/api/hr/payroll', 'GET', [200, 404]);
await testEndpoint('/api/hr/training-programs', 'GET', [200, 404]);
await testEndpoint('/api/hr/training-enrollments', 'GET', [200, 404]);

// ============================================================================
// CLEANUP - Delete created test data
// ============================================================================
console.log('\n📋 Category: Cleanup\n');

if (ctx.testData.get('dealId')) {
  await testEndpoint(`/api/deals/${ctx.testData.get('dealId')}`, 'DELETE', [200, 204]);
}
if (ctx.testData.get('activityId')) {
  await testEndpoint(`/api/activities/${ctx.testData.get('activityId')}`, 'DELETE', [200, 204]);
}
if (ctx.testData.get('productId')) {
  await testEndpoint(`/api/products/${ctx.testData.get('productId')}`, 'DELETE', [200, 204]);
}
if (ctx.testData.get('pipelineId')) {
  await testEndpoint(`/api/pipelines/${ctx.testData.get('pipelineId')}`, 'DELETE', [200, 204]);
}
if (ctx.testData.get('companyId')) {
  await testEndpoint(`/api/companies/${ctx.testData.get('companyId')}`, 'DELETE', [200, 204]);
}
if (ctx.testData.get('contactId')) {
  await testEndpoint(`/api/contacts/${ctx.testData.get('contactId')}`, 'DELETE', [200, 204]);
}

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log('\n📊 TEST SUMMARY REPORT\n');

const totalTests = results.length;
const passedTests = results.filter(r => r.status === 'PASS').length;
const failedTests = results.filter(r => r.status === 'FAIL').length;
const skippedTests = results.filter(r => r.status === 'SKIP').length;

console.log(`Total Tests:    ${totalTests}`);
console.log(`✅ Passed:      ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log(`❌ Failed:      ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);
console.log(`⏭️  Skipped:     ${skippedTests} (${((skippedTests / totalTests) * 100).toFixed(1)}%)`);

if (failedTests > 0) {
  console.log('\n❌ Failed Tests:\n');
  results
    .filter(r => r.status === 'FAIL')
    .forEach(r => {
      console.log(`   ${r.method} ${r.endpoint} [${r.statusCode}] - ${r.error || 'Unknown error'}`);
    });
}

console.log('\n' + '='.repeat(60));
console.log('\n✨ Testing Complete!\n');

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);
