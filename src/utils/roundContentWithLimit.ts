import { getTweetLength } from 'twitter-text';
import { config } from '../conifg';

/**
 * Transform Mastodon status to Twitter compatible form
 * @param content Content of a status
 * @param additionalContents Additional text append
 */
export const roundContentWithLimit = (content: string, additionalContents: string[], limit = 240): string => {
  const { ellipsis } = config;
  const joinedAdditionalContents = additionalContents.join(' ');

  let roundedContent = '';

  const contentLength = getTweetLength([
    content,
    joinedAdditionalContents,
    ellipsis,
  ].join(' '));

  const omittableLength = contentLength - [joinedAdditionalContents, ellipsis].join(' ').length;

  if (contentLength > limit) {
    roundedContent = [
      content.substr(0, omittableLength),
      joinedAdditionalContents,
      ellipsis,
    ].join(' ');
  } else {
    roundedContent = [
      content,
      joinedAdditionalContents,
    ].join(' ');
  }

  return roundedContent;
};
