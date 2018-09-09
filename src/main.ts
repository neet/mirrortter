import Mastodon, { Status } from '@lagunehq/core';
import * as htmlToText from 'html-to-text';
import * as Twitter from 'twit';
import { getTweetLength } from 'twitter-text';
import { config } from './conifg';

class Main {
  protected mastodon = new Mastodon(config.mastodon);
  protected twitter  = new Twitter(config.twitter);

  constructor () {
    this.startMirror();
  }

  /**
   * Starting mirror process
   * @return Nothing
   */
  protected startMirror = async (): Promise<void> => {
    try {
      const me = await this.mastodon.verfiyCredentials();

      /* tslint:disable no-console */
      console.log(`Logged in as @${me.username}`);
      /* tslint:enable no-console */

      if (config.use_streaming) {
        const stream = this.mastodon.streamUser();

        stream.on('update', (status) => {
          if (status.account.id === me.id) {
            this.onUpdate(status);
          }
        });
        return;
      }

      setInterval(async () => {
        for await (const statuses of this.mastodon.fetchAccountStatuses(me.id)) {
          statuses.forEach((status) => this.onUpdate(status));
        }
      }, config.fetch_interval);
    } catch (e) {
      throw new Error('Authorization failed');
    }
  }

  /**
   * Return `false` if status match with either situation:
   * - `ALLOWED_VISIBILITY` doesn't contain status's visibility type
   * - The status is a reblogged one, and `MIRROR_BOOSTS` is false
   * - The status is posted with CW/NSFW, and `MIRROR_SENSITIVE` is false
   * - The status is including any mentions
   * @param status Status that posted
   * @return Result
   */
  protected checkIfInvalidStatus = (status: Status) => (
    (!config.allowed_privacy.includes(status.visibility)) ||
    (!config.mirror_boosts && !!status.reblog) ||
    (!config.mirror_mentions && (!!status.mentions.length || !!status.in_reply_to_id)) ||
    (!config.mirror_sensitive && status.sensitive)
  )

  /**
   * Return `true` if status match with either situation:
   * - if with_url is `always`
   * - if with_url is `only_media` and any media attached
   * - if with_url is `only_sensitive` and status is a sensitive content
   * - if with_url is `media_or_sensitive` and status is a sensitive and/or posted with media
   * @param status Status that posted
   * @return Result
   */
  protected checkIfUrlRequired = (status: Status) => (
    (config.mirror_with_url === 'always') ||
    (config.mirror_with_url === 'only_media' && !!status.media_attachments.length) ||
    (config.mirror_with_url === 'only_sensitive' && status.sensitive) ||
    (config.mirror_with_url === 'media_or_sensitive' && (!!status.media_attachments.length || status.sensitive))
  )

  /**
   * Transform Mastodon status to Twitter compatible form
   * @param content Content of a status
   * @param additionalText Additional text append
   */
  protected transformContent = (content: string, additionalText: string = ''): string => {
    const charCount = getTweetLength(content);
    const { ellipsis } = config;

    let transformedContent = content;
    const requiredChars = charCount + additionalText.length - ellipsis.length;

    if (requiredChars > 240) {
      transformedContent += content.substr(0, requiredChars);
      transformedContent += additionalText;
      transformedContent += ellipsis;
    } else {
      transformedContent += additionalText;
    }

    return transformedContent;
  }

  /**
   * Handle new status
   * @param status status that posted
   * @return Nothing
   */
  protected onUpdate = async (status: Status): Promise<void> => {
    try {
      if (this.checkIfInvalidStatus(status)) {
        return;
      }

      let content = htmlToText.fromString(status.content);
      let additionalText = '';

      // Replace content with spoilter text, if sensitive
      if (status.spoiler_text) {
        content = status.spoiler_text;
      }

      // Append status if required
      if (this.checkIfUrlRequired(status)) {
        additionalText += status.url;
      }

      // Tweet 🐥
      await this.twitter.post('statuses/update', {
        status: this.transformContent(content, additionalText),
      });
    } catch (e) {
      /* tslint:disable no-console */
      console.warn(e.toString());
      /* tslint:enable no-console */
    }
  }
}

/* tslint:disable no-unused-expression */
new Main();
/* tslint:enable no-unused-expression */
