import { setTimeout } from 'timers/promises';

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
}

const results: TestResult[] = [];
let accessToken: string;
let tenantId: number;

async function test(endpoint: string, method: string = 'GET', expectedStatus: number | number[] = 200, body?: any): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (tenantId) headers['X-Tenant-Id'] = String(tenantId);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);
    const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    
    if (expected.includes(res.status)) {
      results.push({ endpoint, method, status: 'PASS', statusCode: res.status });
      console.log(`✅ ${method} ${endpoint} [${res.status}]`);
      return data;
    } else {
      results.push({ endpoint, method, status: 'FAIL', statusCode: res.status, error: data?.error || 'Unexpected status' });
      console.log(`❌ ${method} ${endpoint} [${res.status}] - ${data?.error || 'Unexpected'}`);
      return null;
    }
  } catch (error: any) {
    results.push({ endpoint, method, status: 'FAIL', statusCode: 0, error: error.message });
    console.log(`❌ ${method} ${endpoint} [ERROR] - ${error.message}`);
    return null;
  }
}

console.log('\n🚀 CRM Module Endpoint Testing\n' + '='.repeat(50));

const ts = Date.now();
const registerData = {
  username: `test${ts}`,
  email: `test${ts}@example.com`,
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User'
};

console.log('\n📋 Authentication\n');
const auth = await test('/api/auth/register', 'POST', [200, 201], registerData);
if (auth) {
  accessToken = auth.accessToken;
  tenantId = auth.tenant?.id;
  console.log(`   ℹ️  Tenant ID: ${tenantId}`);
}

console.log('\n📋 CRM Module\n');
await test('/api/crm/health', 'GET', 200);
await test('/api/crm/stats', 'GET', 200);

console.log('\n   Contacts:');
const contact = await test('/api/crm/contacts', 'POST', [200, 201], {
  firstName: 'John',
  lastName: 'Doe',
  email: `john${ts}@test.com`,
  phone: '+1234567890'
});
if (contact?.id) {
  await test('/api/crm/contacts', 'GET', 200);
  await test(`/api/crm/contacts/${contact.id}`, 'GET', 200);
  await test(`/api/crm/contacts/${contact.id}`, 'PUT', 200, { phone: '+9999999999' });
  await test(`/api/crm/contacts/${contact.id}`, 'DELETE', [200, 204]);
}

console.log('\n   Companies:');
const company = await test('/api/crm/companies', 'POST', [200, 201], {
  name: `Company ${ts}`,
  industry: 'Technology'
});
if (company?.id) {
  await test('/api/crm/companies', 'GET', 200);
  await test(`/api/crm/companies/${company.id}`, 'GET', 200);
  await test(`/api/crm/companies/${company.id}`, 'PUT', 200, { industry: 'FinTech' });
  await test(`/api/crm/companies/${company.id}`, 'DELETE', [200, 204]);
}

console.log('\n   Pipelines:');
const pipeline = await test('/api/crm/pipelines', 'POST', [200, 201], {
  pipeline: { title: `Pipeline ${ts}`, description: 'Test' },
  stages: [{ title: 'Stage 1', order: 1 }]
});
if (pipeline?.id) {
  await test('/api/crm/pipelines', 'GET', 200);
  await test(`/api/crm/pipelines/${pipeline.id}`, 'GET', 200);
  await test(`/api/crm/pipelines/${pipeline.id}`, 'PUT', 200, { description: 'Updated' });
}

console.log('\n   Deals:');
const deal = await test('/api/crm/deals', 'POST', [200, 201], {
  title: `Deal ${ts}`,
  value: 10000
});
if (deal?.id) {
  await test('/api/crm/deals', 'GET', 200);
  await test(`/api/crm/deals/${deal.id}`, 'GET', 200);
  await test(`/api/crm/deals/${deal.id}`, 'PUT', 200, { value: 15000 });
  await test(`/api/crm/deals/${deal.id}`, 'DELETE', [200, 204]);
}

console.log('\n   Activities:');
const activity = await test('/api/crm/activities', 'POST', [200, 201], {
  type: 'meeting',
  subject: `Meeting ${ts}`,
  userId: auth?.user?.id || 1
});
if (activity?.id) {
  await test('/api/crm/activities', 'GET', 200);
  await test(`/api/crm/activities/${activity.id}`, 'GET', 200);
  await test(`/api/crm/activities/${activity.id}`, 'PUT', 200, { description: 'Updated' });
  await test(`/api/crm/activities/${activity.id}`, 'DELETE', [200, 204]);
}

console.log('\n   Products:');
const product = await test('/api/crm/products', 'POST', [200, 201], {
  name: `Product ${ts}`,
  title: `Product ${ts}`,
  sku: `SKU${ts}`,
  salePrice: 99.99
});
if (product?.id) {
  await test('/api/crm/products', 'GET', 200);
  await test(`/api/crm/products/${product.id}`, 'GET', 200);
  await test(`/api/crm/products/${product.id}`, 'PUT', 200, { salePrice: 89.99 });
  await test(`/api/crm/products/${product.id}`, 'DELETE', [200, 204]);
}

console.log('\n   Users:');
const usersList = await test('/api/crm/users', 'GET', 200);  // Expect 200, will FAIL on 500
if (auth?.user?.id) {
  await test(`/api/crm/users/${auth.user.id}`, 'GET', 200);
}

console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary\n');
const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;

console.log(`Total: ${total} | Passed: ${passed} (${((passed/total)*100).toFixed(1)}%) | Failed: ${failed}`);

if (failed > 0) {
  console.log('\n❌ Failed:\n');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`   ${r.method} ${r.endpoint} [${r.statusCode}] - ${r.error}`);
  });
}

console.log('\n' + (failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed') + '\n');

process.exit(failed > 0 ? 1 : 0);
