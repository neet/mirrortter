import { Status } from '@lagunehq/core';
import { checkIfInvalidStatus } from '../checkIfInvalidStatus';

describe('checkIfInvalidStatus', () => {

  it('Invalid when status visiblity is not included in the config', () => {
    const status = {
      id:         '1',
      visibility: 'private',
    } as any as Status;

    const result = checkIfInvalidStatus(status, { allowed_visibility: ['public'] });

    expect(result).toBe(true);
  });

  it('Valid when status visiblity is included in the config', () => {
    const status = {
      id:         '1',
      visibility: 'private',
    } as any as Status;

    const result = checkIfInvalidStatus(status, { allowed_visibility: ['public', 'private'] });

    expect(result).toBe(false);
  });

  it('Invalid when reblogs are not allowed by the config', () => {
    const status = {
      id:     '1',
      reblog: { id: '2' },
    } as any as Status;

    const result = checkIfInvalidStatus(status, { mirror_boosts: false });

    expect(result).toBe(true);
  });

  it('Valid when reblogs are allowed by the config', () => {
    const status = {
      id:     '1',
      reblog: { id: '2' },
    } as any as Status;

    const result = checkIfInvalidStatus(status, { mirror_boosts: true });

    expect(result).toBe(false);
  });

  it('Invalid when mentions are not allowed by the config', () => {
    const status = {
      id:             '1',
      mentions:       [{ id: '3' }],
      in_reply_to_id: '4',
    } as any as Status;

    const result = checkIfInvalidStatus(status, { mirror_mentions: false });

    expect(result).toBe(true);
  });

  it('Valid when mentions are allowed by the config', () => {
    const status = {
      id:             '1',
      mentions:       [{ id: '3' }],
      in_reply_to_id: '4',
    } as any as Status;

    const result = checkIfInvalidStatus(status, { mirror_mentions: true });

    expect(result).toBe(false);
  });

  it('Invalid when sensitive is not allowed by the config', () => {
    const status = {
      id:        '1',
      sensitive: true,
    } as any as Status;

    const result = checkIfInvalidStatus(status, { mirror_sensitive: false });

    expect(result).toBe(true);
  });

  it('Valid when sensitive is allowed by the config', () => {
    const status = {
      id:        '1',
      sensitive: true,
    } as any as Status;

    const result = checkIfInvalidStatus(status, { mirror_sensitive: true });

    expect(result).toBe(false);
  });
});
