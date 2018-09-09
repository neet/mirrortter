# mirrortter
[![Build Status](https://travis-ci.com/neet/mirrortter.svg?branch=master)](https://travis-ci.com/neet/mirrortter)
[![Maintainability](https://api.codeclimate.com/v1/badges/e90ed62ffab572b9e0e4/maintainability)](https://codeclimate.com/github/neet/mirrortter/maintainability)

🐘 **Mirrortter** forwards your awesome toots to Twitter from the fediverse

### Installation
First, you need to copy `.env.exmaple` to `.env` which is production environment variable
```
cp .env.example .env
```

Then specify some authorization information, for more preferences, see [Configuration](#configuration) section below
```diff
+MASTODON_URL=
+MASTODON_ACCESS_TOKEN=
+MASTODON_STREAMING_URL=
+TWITTER_CONSUMER_KEY=
+TWITTER_CONSUMER_SECRET=
+TWITTER_ACCESS_TOKEN=
+TWITTER_ACCESS_TOKEN_SECRET=
```

Finally, run following commands to start the app:
```
yarn
yarn start
```

### Configuration
| key                      | description                                         |
| :----------------------- | :-------------------------------------------------- |
| `MASTODON_URL`           | URL of your Mastodon instance, including `https://` |
| `MASTODON_STREAMING_URL` | Streaming API endpoint of your mastodon instance    |
| `MASTODON_ACCESS_TOKEN`  | Access token of your Mastodon API                   |
| `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET` | Authroization information of Twitter API |
| `FETCH_INTERVAL` | Interval of polling user's statuses |
| `USE_STREAMING`  | Whether use streaming API or not, if `ture` specified, `FETCH_INTERVAL` will be ignored |
| `MIRROR_BOOSTS` | Whether tweet statuses which you boosted in Mastodon |
| `MIRROR_MENTIONS` | Whether tweet statuses which you mentioned to someone in Mastoodn |
| `MIRROR_SENSITIVE` | Whether tweet statuses which is sensitive |
| `MIRROR_WITH_URL` | Flag of tweeting with URL, following values are possible:<br/>・`always` Always tweet with URL<br/>・`only_media` Tweet with URL when media attached<br/>・`only_sensitive` Tweet with URL when status is a senstive content<br/>・`media_or_sensitive` Tweet with URL when media attached and/or sensitive<br/>・`never` Tweet only content
| `ALLOWED_VISIBILITY` | Space-sperated text of allowed visiblity type of Mastodon status, public unlisted private and direct are possible |
| `ELLIPSIS` | Style of ellipsis which will be used when omitting content because of text limit issue |
