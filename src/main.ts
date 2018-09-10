import Mastodon, { Credentials, Status } from '@lagunehq/core';
import h2t from 'html2plaintext';
import * as Twit from 'twit';
import { getTweetLength } from 'twitter-text';
import { config } from './conifg';

class Main {
  /** Mastodon API client */
  protected mastodon = new Mastodon(config.mastodon);

  /** Twitter API client */
  protected twitter = new Twit(config.twitter);

  /** Ids maps of Mastodon statuses and Twitter statuses */
  protected idsMap = new Map<string, string>();

  constructor () {
    this.startMirroring();
  }

  /**
   * Starting mirror process
   * @return Nothing
   */
  protected startMirroring = async (): Promise<void> => {
    const me = await this.mastodon.verfiyCredentials();

    /* tslint:disable no-console */
    console.log(`Logged in as @${me.username}`);
    /* tslint:enable no-console */

    if (config.use_streaming) {
      this.startStreaming(me);
    } else {
      this.startPolling(me);
    }
  }

  /**
   * Starting streaming and bind result to the method
   * @param me Result of verify_credentials
   * @return nothing
   */
  protected startStreaming = (me: Credentials) => {
    const stream = this.mastodon.streamUser();

    stream.on('update', (status) => {
      if (status.account.id === me.id) {
        this.onUpdate(status);
      }
    });

    stream.on('delete', (id) => {
      this.onDelete(id);
    });

    stream.on('connectFailed', () => {
      throw new Error('WebSocket connection failed');
    });
  }

  /**
   * Starting polling and bind result to this.onUpdate
   * @param me Result of verify_credentials
   * @return nothing
   */
  protected startPolling = async (me: Credentials) => {
    // Initialize since_id with latest id of status
    let since_id = (await this.mastodon.fetchAccountStatuses(me.id).next()).value[0].id;

    setInterval(async () => {
      try {
        const { value: statuses } = await this.mastodon.fetchAccountStatuses(me.id, { since_id }).next();

        if (statuses.length) {
          since_id = statuses[0].id;

          statuses.reverse().forEach((status) => {
            this.onUpdate(status);
          });
        }
      } catch (error) {
        /* tslint:disable no-console */
        console.warn(error);
        /* tslint:enable no-console */
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
    (!config.allowed_visibility.includes(status.visibility)) ||
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
    const { ellipsis } = config;

    let transformedContent = content;

    const requiredChars
      = getTweetLength(content)
      + getTweetLength(additionalText)
      + getTweetLength(ellipsis);

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

      let content = h2t(status.content);
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
      const tweet = await this.twitter.post('statuses/update', {
        status: this.transformContent(content, additionalText),
      });

      // Mapping created tweet's id and delete it 1 hour later
      this.idsMap.set(status.id, (tweet.data as Twit.Twitter.Status).id_str);
      setTimeout(() => this.idsMap.delete(status.id), 1000 * 60 * 60);

    } catch (error) {
      /* tslint:disable no-console */
      console.warn(error);
      /* tslint:enable no-console */
    }
  }

  /**
   * Handle deleted status
   * @param id Status id which deleted
   * @return nothig
   */
  protected onDelete = async (id: string): Promise<void> => {
    try {
      const tweetId = this.idsMap.get(id);

      if (tweetId) {
        await this.twitter.post('statuses/destroy/:id', { id: tweetId });
        this.idsMap.delete(id);
      }
    } catch (error) {
      /* tslint:disable no-console */
      console.warn(error);
      /* tslint:enable no-console */
    }
  }
}

/* tslint:disable no-unused-expression */
new Main();
/* tslint:enable no-unused-expression */
