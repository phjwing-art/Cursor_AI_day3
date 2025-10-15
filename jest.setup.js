// jest.setup.js
// Jest 테스트 설정

// 환경변수 설정
process.env.NODE_ENV = 'test'
process.env.GEMINI_API_KEY = 'test-api-key'
process.env.GEMINI_MODEL = 'gemini-2.0-flash-001'
process.env.GEMINI_MAX_TOKENS = '8192'
process.env.GEMINI_TIMEOUT_MS = '10000'
process.env.GEMINI_DEBUG = 'true'

