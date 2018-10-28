import { Status } from '@lagunehq/core';
import { shouldInsertStatusUrl } from '../shouldInsertStatusUrl';

describe('shouldInsertStatusUrl', () => {

  it ('Returns true when the config is "always"', () => {
    const status = {
      id: '1',
    } as any as Status;

    const result = shouldInsertStatusUrl(status, {
      mirror_with_url: 'always',
    });

    expect(result).toBe(true);
  });

  it ('Returns true when the config is "only_media" and has media', () => {
    const status = {
      id: '1',
      media_attachments: ['12345'],
    } as any as Status;

    const result = shouldInsertStatusUrl(status, {
      mirror_with_url: 'only_media',
    });

    expect(result).toBe(true);
  });

  it ('Returns false when the config is "only_media" and has no media', () => {
    const status = {
      id: '1',
      media_attachments: [],
    } as any as Status;

    const result = shouldInsertStatusUrl(status, {
      mirror_with_url: 'only_media',
    });

    expect(result).toBe(false);
  });

  it ('Returns true when the config is "only_sensitive" and the status is sensitive', () => {
    const status = {
      id: '1',
      sensitive: true,
    } as any as Status;

    const result = shouldInsertStatusUrl(status, {
      mirror_with_url: 'only_sensitive',
    });

    expect(result).toBe(true);
  });

  it ('Returns false when the config is "only_sensitive" and the status is not sensitive', () => {
    const status = {
      id: '1',
      sensitive: false,
    } as any as Status;

    const result = shouldInsertStatusUrl(status, {
      mirror_with_url: 'only_sensitive',
    });

    expect(result).toBe(false);
  });

  it ('Returns true when the config is "media_or_sensitive" and the status has media', () => {
    const status = {
      id: '1',
      media_attachments: ['12345'],
    } as any as Status;

    const result = shouldInsertStatusUrl(status, {
      mirror_with_url: 'media_or_sensitive',
    });

    expect(result).toBe(true);
  });

  it ('Returns true when the config is "media_or_sensitive" and the status is sensitive', () => {
    const status = {
      id: '1',
      sensitive: true,
    } as any as Status;

    const result = shouldInsertStatusUrl(status, {
      mirror_with_url: 'media_or_sensitive',
    });

    expect(result).toBe(true);
  });

  it ('Returns false when the config is "media_or_sensitive" and neither the status has media nor the status is sensitive', () => {
    const status = {
      id: '1',
      sensitive: false,
      media_attachments: [],
    } as any as Status;

    const result = shouldInsertStatusUrl(status, {
      mirror_with_url: 'media_or_senstive',
    });

    expect(result).toBe(false);
  });
});
