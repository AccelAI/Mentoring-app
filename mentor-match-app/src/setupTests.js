// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Firebase Auth (node build) pulls in undici in some environments, which
// requires TextEncoder/TextDecoder. Jest's environment may not provide them.
// Polyfill them for tests only.
// eslint-disable-next-line no-undef
if (typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
  // eslint-disable-next-line global-require
  const { TextEncoder, TextDecoder } = require('util')
  // eslint-disable-next-line no-undef
  global.TextEncoder = TextEncoder
  // eslint-disable-next-line no-undef
  global.TextDecoder = TextDecoder
}

// Firebase Auth may pull in undici, which expects Web Streams APIs.
// Polyfill ReadableStream/WritableStream/TransformStream for Jest.
// eslint-disable-next-line no-undef
if (typeof ReadableStream === 'undefined') {
  // eslint-disable-next-line global-require
  const streams = require('web-streams-polyfill')
  // eslint-disable-next-line no-undef
  global.ReadableStream = streams.ReadableStream
  // eslint-disable-next-line no-undef
  global.WritableStream = streams.WritableStream
  // eslint-disable-next-line no-undef
  global.TransformStream = streams.TransformStream
}

// jsdom does not implement canvas APIs used by lottie-web. Mock lottie-react
// so importing components that use animations doesn't crash tests.
jest.mock('lottie-react', () => {
  // eslint-disable-next-line global-require
  const React = require('react')
  const Mock = (props) => React.createElement('div', { 'data-testid': 'lottie-mock', ...props })
  return { __esModule: true, default: Mock }
})

// Defensive: some codebases import lottie-web directly.
jest.mock('lottie-web', () => ({ __esModule: true, default: {} }))

// Avoid React act() warnings from auth state listeners in tests.
// We don't need real Firebase Auth behavior for component render tests.
jest.mock('firebase/auth', () => {
  const actual = jest.requireActual('firebase/auth')
  return {
    ...actual,
    onAuthStateChanged: (_auth, _callback) => {
      // Do not invoke callback; keep provider stable in Jest.
      return () => {}
    }
  }
})
