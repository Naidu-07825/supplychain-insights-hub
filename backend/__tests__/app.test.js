const request = require('supertest');
const app = require('../app');

describe('Basic API', () => {
  test('GET / returns running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/SupplyChain Insights Hub API running/);
  });
});
