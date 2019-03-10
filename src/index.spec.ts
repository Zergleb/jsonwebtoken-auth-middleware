import test from 'ava';
import express from 'express';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import authMiddleware from './index';

// Don't bother they aren't used anywhere else.
const certs = {
  privateCert: `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgHb1WuK4tga+VpseYzCXY7tb79LHfsSmH+b8LXMuXr0WA0tv2Sf6
P1Qcf3tQWncHLgOsibnfgrUKgjTFIEZKzTdTJ0VGfO1HY8PEMIfieYo4dx6FOYed
JvECwCEs6cvq6BZEtNrtpukhTehJfUyUBZX2uNfLw3H6SLlU1ilfJSCZAgMBAAEC
gYBjXTJbatpw65A/5bQIpIvjtjmuoICdFf5T3JTCPxtXagm6e2SyZe97/InnoQjP
n6mp2/b20WHGg06bcYUx8c1ToxmTq7BQTtzlR1vWmloUpNoGoiuO9D4QdaS1ckyh
ThkOhP6GBdrDVSTIfpefj9NbRImiQWFHDpjCUFR0HKYUeQJBALjAXG7pryrx7goP
5lith6hQ12EuiOmPe8GhsIKh1nPSPLOnypBryPyBFJqUV0SAex9ANXa1/emXeDQH
CnuU+VcCQQCk1Y+UsTM/L3AAxkgThoWtjVcy7DC7QZz8tLMhyJeO2XuicVKsyJow
5v0jdOy1XpMrBsIP5h9DMJ5rPILIZE+PAkBh+RCLeLz9pyI2j8v1hsCDz6sHzCeq
w/465sW14KDa9shd9UMEZ0REMyd7+eJ1XzTrk59GfqhR8ZM68+jpNE0tAkBltkI7
Bn0Q6Dy8vZ2MLt4eEbFVAtmvMvWkGfzPQ/ABfcIEotjZNY+vzVk2n9fQsuMtEaZ+
GQoBc+bNVTF+ZieRAkEAq4hnBO3YZz9l4XeD7ixALTuFvts6e5BQp09yEy1opmPU
IHXr8IBq//bheMksL1NxirBNOjVvJlxUnlzBnvP2lg==
-----END RSA PRIVATE KEY-----`,
  publicCert: `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHb1WuK4tga+VpseYzCXY7tb79LH
fsSmH+b8LXMuXr0WA0tv2Sf6P1Qcf3tQWncHLgOsibnfgrUKgjTFIEZKzTdTJ0VG
fO1HY8PEMIfieYo4dx6FOYedJvECwCEs6cvq6BZEtNrtpukhTehJfUyUBZX2uNfL
w3H6SLlU1ilfJSCZAgMBAAE=
-----END PUBLIC KEY-----`
};

const app = express();
const middleware = authMiddleware(certs.publicCert);

app.use(middleware);

app.get('/test', (req, res) => {
  res.send(req.jwt);
});

test('Test endpoints are secured by middleware', async t => {
  const request = supertest(app);

  try {
    await request.get('/test');
    t.fail('Should have thrown an exception when receiving a 401');
  } catch (err) {
    t.is(err.status, 401);
  }
});

test('Test that jwt information is passed to requests', async t => {
  const request = supertest(app);

  t.log(certs.privateCert);
  const token = jwt.sign({ myPayload: 'myValue' }, certs.privateCert, {
    algorithm: 'RS256'
  });

  t.log(token);
  const response = await request
    .get('/test')
    .set('Authorization', `Bearer ${token}`);

  t.is(response.status, 200);
  t.is(response.body.myPayload, 'myValue');
});
