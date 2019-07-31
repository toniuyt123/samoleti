class BaseAssertionError extends Error {
  constructor (message, name) {
    super(message);
    this.name = name;
  }
}

class AssertionError extends BaseAssertionError {
  constructor (message) {
    super(message, 'AssertonError');
  }
}

class UserAssertionError extends BaseAssertionError {
  constructor (message) {
    super(message, 'UserAssertonError');
  }
}

class PeerAssertionError extends BaseAssertionError {
  constructor (message) {
    super(message, 'PeerAssertonError');
  }
}

const assert = (condition, message) => {
  if (!condition) {
    throw new AssertionError(message);
  }
};

const assertUser = (condition, message) => {
  if (!condition) {
    throw new UserAssertionError(message);
  }
};

const assertPeer = (condition, message) => {
  if (!condition) {
    throw new PeerAssertionError(message);
  }
};

module.exports = {
  UserAssertionError,
  AssertionError,
  PeerAssertionError,
  assert,
  assertUser,
  assertPeer,
};
