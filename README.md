# gridsome-source-craftql

> Integrate your Craft CMS installation with Gridsome via CraftQL

## Install

- `yarn add gridsome-source-craftql`
- `npm install gridsome-source-craftql`

## Usage

```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-source-craftql',
      options: {
        url: 'https://example.com/api',
        token: process.env.AUTH_TOKEN,
      },
    },
  ],
}
```

## Options

#### url

- Type: `string` _required_

The URL of a CraftQL API endpoint to request your schema from.

#### fieldName

- Type: `string`
- Default: `'craft'`

The name that should be used to namespace your CraftQL schema when it's merged in, so that it doesn't conflict with any local data.

For instance, if you put "craftcms" your remote schema's data will be available by querying like so:

```
query {
  craftcms {
    helloWorld
  }
}
```

#### typeName

- Type: `string`
- Default: `fieldName`

The prefix to be used for your imported schema's field types.

#### token

- Type: `string`

Your CraftQL bearer token. You can obtain this token from CraftQL's plugin settings in your Craft CMS control panel. **Make sure you enable the proper permissions for your token**.

**Note**: For safety, you should pass any sensitive tokens/passwords as environmental variables. To learn more, see the [Gridsome Docs on Environmental Variables](https://gridsome.org/docs/environment-variables/).
