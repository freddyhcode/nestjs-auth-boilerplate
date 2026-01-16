const CONFIG = JSON.parse(open('./default.k6.json'));

export const BASE_URL = CONFIG.base_url;

export const USER = CONFIG.user;
export const PASSWORD = CONFIG.password;
export const ACCESS_TOKEN = CONFIG.access_token;
export const PURPOSE_TOKEN = CONFIG.purpose_token;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export const AUTH_HEADERS_ACCESS_TOKEN = {
  ...DEFAULT_HEADERS,
  Authorization: `Bearer ${ACCESS_TOKEN}`,
};

export const AUTH_HEADERS_PORPUSE = {
  ...DEFAULT_HEADERS,
  Authorization: `Bearer ${PURPOSE_TOKEN}`,
};

export const DEFAULT_THRESHOLDS = {
  'http_req_failed{expected_response:true}': ['rate<0.10'],
  http_req_duration: ['p(95)<500'],
};
