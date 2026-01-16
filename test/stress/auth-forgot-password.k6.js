import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  BASE_URL,
  DEFAULT_HEADERS,
  DEFAULT_THRESHOLDS,
  USER,
  PASSWORD,
} from './config/config.js';

export const options = {
  scenarios: {
    // Tráfico normal esperado
    load_test: {
      executor: 'constant-arrival-rate',
      rate: 10,
      timeUnit: '1m',
      duration: '1m',
      preAllocatedVUs: 2,
      maxVUs: 10,
    },

    // Fuerza rate limit / brute force
    stress_test: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1m',
      duration: '30s',
      startTime: '1m',
      preAllocatedVUs: 5,
      maxVUs: 20,
    },

    // Picos repentinos
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1m',
      startTime: '1m30s',
      preAllocatedVUs: 10,
      maxVUs: 50,
      stages: [
        { target: 100, duration: '15s' },
        { target: 100, duration: '30s' },
        { target: 0, duration: '15s' },
      ],
    },

    // Verifica recuperación post-rate-limit
    smoke_test: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      startTime: '2m30s',
    },
  },

  thresholds: DEFAULT_THRESHOLDS,
};

export default function () {
  const payload = JSON.stringify({
    email: USER,
  });

  const res = http.post(`${BASE_URL}/auth/forgot-password`, payload, {
    headers: DEFAULT_HEADERS,
  });

  check(res, {
    'status válido (200 | 201 | 401 | 429)': (r) =>
      [200, 201, 401, 429].includes(r.status),
    'latencia < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
