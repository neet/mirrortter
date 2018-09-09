import Mastodon, { Status } from '@lagunehq/core';
import Twitter from 'twit';
import { getTweetLength } from 'twitter-text';
import { config } from './conifg';

export class Main {
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
    if (config.use_streaming) {
      const stream = this.mastodon.streamPublicTimeline();
      stream.on('update', this.onUpdate);
      return;
    }

    const { id: me } = await this.mastodon.verfiyCredentials();

    setInterval(async () => {
      for await (const statuses of this.mastodon.fetchAccountStatuses(me)) {
        statuses.forEach((status) => this.onUpdate(status));
      }
    }, config.fetch_interval);
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
    (config.allowed_privacy.includes(status.visibility)) ||
    (config.mirror_with_url === 'mirror_boosts' && !!status.reblog) ||
    (config.mirror_with_url === 'mirror_mentions' && !!status.mentions.length) ||
    (config.mirror_with_url === 'mirror_sensitive' && status.sensitive)
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

    let transformedContent: string = '';
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
    if (this.checkIfInvalidStatus(status)) {
      return;
    }

    let { content } = status;
    let additionalText = '';

    // Replace content with spoilter text, if sensitive
    if (status.spoiler_text) {
      content = status.spoiler_text;
    }

    // Append status if required
    if (this.checkIfUrlRequired) {
      additionalText += status.url;
    }

    // Tweet 🐥
    await this.twitter.post('statuses/update', {
      status: this.transformContent(content, additionalText),
    });
  }
}
