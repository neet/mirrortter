import { Status } from '@lagunehq/core';
import { config as defaultConfig } from '../conifg';

/**
 * Return `false` if status match with either situation:
 * - `ALLOWED_VISIBILITY` doesn't contain status's visibility type
 * - The status is a reblogged one, and `MIRROR_BOOSTS` is false
 * - The status is posted with CW/NSFW, and `MIRROR_SENSITIVE` is false
 * - The status is including any mentions
 * @param status Status that posted
 * @return Result
 */
export const checkIfValidStatus = (status: Status, option?: Partial<typeof defaultConfig>) => {
  const config = { ...defaultConfig, ...option };

  return (
    config.allowed_visibility.includes(status.visibility)
    && !(!config.mirror_boosts    && status.reblog)
    && !(!config.mirror_sensitive && status.sensitive)
    && !(!config.mirror_mentions  && (status.mentions.length !== 0 || !!status.in_reply_to_id))
  );
};
