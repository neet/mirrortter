import { Status } from '@lagunehq/core';
import { config as defaultConfig } from '../conifg';

/**
 * Return `true` if status match with either situation:
 * - if with_url is `always`
 * - if with_url is `only_media` and any media attached
 * - if with_url is `only_sensitive` and status is a sensitive content
 * - if with_url is `media_or_sensitive` and status is a sensitive and/or posted with media
 * @param status Status that posted
 * @return Result
 */
export const shouldInsertStatusUrl = (status: Status, options?: Partial<typeof defaultConfig>) => {
  const config = { ...defaultConfig, ...options };

  return (
    (config.mirror_with_url === 'always') ||
    (config.mirror_with_url === 'only_media' && !!status.media_attachments.length) ||
    (config.mirror_with_url === 'only_sensitive' && status.sensitive) ||
    (config.mirror_with_url === 'media_or_sensitive' && (!!status.media_attachments.length || status.sensitive))
  );
};
