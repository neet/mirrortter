import Mastodon, { AccountCredentials, Status } from '@lagunehq/core';
import * as htmlToText from 'html-to-text';
import * as Twit from 'twit';
import { config } from './conifg';
import { checkIfValidStatus } from './utils/checkIfValidStatus';
import { roundContentWithLimit } from './utils/roundContentWithLimit';
import { shouldInsertStatusUrl } from './utils/shouldInsertStatusUrl';

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
  protected startStreaming = (me: AccountCredentials) => {
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
  protected startPolling = async (me: AccountCredentials) => {
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
   * Handle new status
   * @param status status that posted
   * @return Nothing
   */
  protected onUpdate = async (status: Status): Promise<void> => {
    try {
      if (checkIfValidStatus(status)) {
        return;
      }

      const content = status.spoiler_text
        ? status.spoiler_text
        : htmlToText.fromString(status.content, { hideLinkHrefIfSameAsText: true });

      const additionalContents: string[] = [];

      // Append status if required
      if (shouldInsertStatusUrl(status) && status.url) {
        additionalContents.push(status.url);
      }

      // Tweet 🐥
      const tweetData = await this.twitter.post('statuses/update', {
        status: roundContentWithLimit(content, additionalContents),
      })
        .then((tweet) => tweet.data as Twit.Twitter.Status);

      // Mapping created tweet's id and delete it 1 hour later
      this.idsMap.set(status.id, tweetData.id_str);

      setTimeout(() => {
        this.idsMap.delete(status.id);
      }, 1000 * 60 * 60);

    } catch (error) {
      // tslint:disable-next-line no-console
      console.warn(error);
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
      // tslint:disable-next-line no-console
      console.warn(error);
    }
  }
}

// tslint:disable-next-line no-unused-expression
new Main();
