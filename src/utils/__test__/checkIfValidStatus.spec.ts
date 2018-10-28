import { Status } from '@lagunehq/core';
import { checkIfValidStatus } from '../checkIfValidStatus';

describe('checkIfValidStatus', () => {

  it('Invalid when status visibility is not included in the config', () => {
    const status = {
      id:         '1',
      visibility: 'private',
      mentions:   [],
    } as any as Status;

    const result = checkIfValidStatus(status, {
      allowed_visibility: ['public'],
    });

    expect(result).toBe(false);
  });

  it('Valid when status visibility is included in the config', () => {
    const status = {
      id:         '1',
      visibility: 'private',
      mentions:   [],
    } as any as Status;

    const result = checkIfValidStatus(status, {
      allowed_visibility: ['public', 'private'],
    });

    expect(result).toBe(true);
  });

  it('Invalid when reblogs are not allowed by the config', () => {
    const status = {
      id:         '1',
      visibility: 'public',
      reblog:     { id: '2' },
      mentions:   [],
    } as any as Status;

    const result = checkIfValidStatus(status, {
      mirror_boosts: false,
      allowed_visibility: ['public'],
    });

    expect(result).toBe(false);
  });

  it('Valid when reblogs are allowed by the config', () => {
    const status = {
      id:         '1',
      visibility: 'public',
      reblog:     { id: '2' },
      mentions:   [],
    } as any as Status;

    const result = checkIfValidStatus(status, {
      mirror_boosts: true,
      allowed_visibility: ['public'],
    });

    expect(result).toBe(true);
  });

  it('Invalid when mentions are not allowed by the config', () => {
    const status = {
      id:             '1',
      visibility:     'public',
      mentions:       [{ id: '3' }],
      in_reply_to_id: '4',
    } as any as Status;

    const result = checkIfValidStatus(status, {
      mirror_mentions: false,
      allowed_visibility: ['public'],
    });

    expect(result).toBe(false);
  });

  it('Valid when mentions are allowed by the config', () => {
    const status = {
      id:             '1',
      visibility:     'public',
      mentions:       [{ id: '3' }],
      in_reply_to_id: '4',
    } as any as Status;

    const result = checkIfValidStatus(status, {
      mirror_mentions: true,
      allowed_visibility: ['public'],
    });

    expect(result).toBe(true);
  });

  it('Invalid when sensitive is not allowed by the config', () => {
    const status = {
      id:         '1',
      visibility: 'public',
      sensitive:  true,
      mentions:   [],
    } as any as Status;

    const result = checkIfValidStatus(status, {
      mirror_sensitive: false,
      allowed_visibility: ['public'],
    });

    expect(result).toBe(false);
  });

  it('Valid when sensitive is allowed by the config', () => {
    const status = {
      id:         '1',
      visibility: 'public',
      sensitive:  true,
      mentions:   [],
    } as any as Status;

    const result = checkIfValidStatus(status, {
      mirror_sensitive: true,
      allowed_visibility: ['public'],
    });

    expect(result).toBe(true);
  });
});
