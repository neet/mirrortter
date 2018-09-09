import { StatusVisibility } from '@lagunehq/core';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

type MirrorWithUrl
  = 'always'
  | 'only_media'
  | 'only_sensitive'
  | 'media_or_sensitive'
  | 'never';

dotenv.config({ path: resolve(__dirname, '..', '.env') });

const { env } = process;
const boolify = (state: any) => state === 'true' ? true : false;

export const config = {
  use_streaming: boolify(env.USE_STREAMING) || true,

  mirror_boosts: boolify(env.MIRROR_BOOSTS) || false,
  mirror_mentions: boolify(env.MIRROR_MENTIONS) || false,
  mirror_sensitive: boolify(env.MIRROR_SENSITIVE) || false,

  mirror_with_url: env.MIRROR_WITH_URL || 'never' as MirrorWithUrl,

  fetch_interval: Number(env.FETCH_INTERVAL) || 60000,

  allowed_privacy:
    (env.ALLOWED_PRIVACY as string).split(' ')
    || ['public', 'unlisted', 'private', 'direct'] as StatusVisibility[],

  ellipsis: env.ELLIPSIS || '...' as string,

  mastodon: {
    url: env.MASTODON_URL as string,
    access_token: env.MASTODON_ACCESS_TOKEN as string,
    streaming_url: env.MASTODON_STREAMING_URL as string,
  },

  twitter: {
    consumer_key: env.TWITTER_CONSUMER_KEY as string,
    consumer_secret: env.TWITTER_CONSUMER_SECRET as string,
    access_token: env.TWITTER_ACCESS_TOKEN as string,
    token_secret: env.TWITTER_TOKEN_SECRET as string,
  },
};
