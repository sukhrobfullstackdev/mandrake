# Auth Relayer (a.k.a. "Mandrake")

> FE application for creating Decentralized ID Tokens and securely authenticating users in a passwordless way.

## Table of Contents

- [Getting Started](#getting-started)
  - [Setup node version](#setup-node-version)
  - [Setup NPM Token](#setup-npm-token)
  - [Setup GPG for Signed Commits](#setup-gpg-for-signed-commits)
  - [Installation](#installation)
- [Starting Auth Relayer](#starting-auth-relayer-)
  - [Developing with a local backend server](#developing-with-a-local-backend-server)
  - [Developing locally with a staging server](#developing-locally-with-a-staging-server)
  - [Developing with a local Magic SDK](#developing-with-a-local-magic-sdk)
- [Building \& Serving for Production](#building--serving-for-production-)
- [Rolling Back on Production](#rolling-back-on-production)
- [Architecture & Sequence Diagrams](architecture-sequence-diagrams)
- [Testing](#testing)
  - [Relayer Test Kitchen](relayer-test-kitchen)
  - [SDK Methods](#sdk-methods)
    - [Auth](#auth)
  - [QA Wolf - Manual Smoke Test on Stagef](qa-wolf-manual-smoke-test-on-stagef)
- [Environment Variables](#environment-variables)

## Getting Started

### Setup node version

Current dev node version is 20.10

Please install [node version manager nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and use it to switch the node version

```bash
cd /path/to/mandrake
nvm use
```

### Setup NPM Token

Follow [NPM documentation](https://docs.npmjs.com/creating-and-viewing-authentication-tokens) to generate a token with access to private packages.

Next, you'll need to assign your NPM token to an environment variable in your preferred shell.

```zsh
export NPM_TOKEN="00000000-0000-0000-0000-000000000000"
```

Refer to [NPM's CI documentation](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow) for further information and troubleshooting help.

### Installation

Install NPM dependencies using [PNPM](https://pnpm.io/installation/):

```zsh
pnpm install
```

### Setup Vercel CLI

We use the Vercel CLI to pull down environment variables to be used in local development. When running `pnpm local`, for example, it will pull down all environment variables from the Vercel `Development` environment.

##### Install and configure the CLI

First, we need to setup the CLI on our local machine:

1. Install globally: `pnpm i -g vercel` (alternative: use `pnpx` to run vercel commands)
2. Ensure it was installed correctly: `vercel --version`
3. Login: `vercel login`
4. This will take you into the browser to authenticate with your Vercel account
5. Back in your terminal, verify with `vercel whoami`
6. Switch to our team: `vercel switch magiclabs`
7. Link your local mandrake to the project in Vercel: `vercel link`
8. It will run through a series of questions. Make sure to select "Magic Labs" as the scope and it should automatically find `magiclabs/mandrake`. Just say yes from there.
9. You're all set!

##### Running the app locally

Now when you run pnpm local (dev, stage, etc), it will automatically pull the environment variables from Vercel from the correct environment. The Vercel CLI will store these in a generated `.env` file that is _gitignored_. Each time you switch environments, it will delete and create a new `.env` file.

##### Override with .local.env

But what if you need to locally override the `.env` file that Vercel CLI generates? Then you can create a `.local.env` file in the root of the project. Any variables inside this file will override the matching variable in the `.env` file. This `.local.env` file is for your machine only and will also be gitignored.

### Setup GPG for Signed Commits [⤴](#table-of-contents)

**_ IMPORTANT _** The order of operations here is important so make sure each step is completed before proceeding to the next one otherwise you may experience issues

#### 1. Install GPG & Pinentry-Mac

```zsh
brew update
brew upgrade
brew install gnupg
brew install pinentry-mac
```

#### 2. Generate a GPG Key

Follow these steps to [Generate a new GPG Key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key). Make sure you follow all of the steps in the GitHub documentation above.

##### Notes

###### On Step #9 Type a secure passphrase - This can be any password you like. Make sure to remember it

###### On Step #14 Add the GPG key to your GitHub account - You need to click on this link and follow the steps to add the GPG key to your GitHub account before proceeding to the next step in this readme.

#### 3. Update your .zshrc or .bashrc config

Add the following export to whichever terminal shell you are using

```
export GPG_TTY=$(tty)
```

#### 4. Create gpg.conf

```zsh
cd ~/.gnupg
touch gpg.conf
nano gpg.conf
```

Copy and paste the below snippet into gpg-agent.conf

```zsh
no-tty
use-agent

# This silences the "you need a passphrase" message once the passphrase handling is all set.
# Use at your own discretion - may prevent the successful interactive use of some operations.
batch

# Ensures the cross certification "back signature" on the subkey is present and
# valid. This protects against a subtle attack against subkeys that can sign.
require-cross-certification
```

#### 5. Create gpg-agent.conf for Pinentry-mac

```zsh
cd ~/.gnupg
touch gpg-agent.conf
nano gpg-agent.conf
```

Copy and paste the below snippet into gpg-agent.conf

```zsh
# Enables GPG to find gpg-agent
use-standard-socket


# Connects gpg-agent to the OSX keychain via the brew-installed
# pinentry program from GPGtools. This is the OSX 'magic sauce',
# allowing the gpg key's passphrase to be stored in the login
# keychain, enabling automatic key signing.
pinentry-program /opt/homebrew/bin/pinentry-mac
```

#### GPG Errors

If you get the following error,

```zsh
error: gpg failed to sign the data:
gpg: signing failed: No pinentry
```

You can fix it by restarting your GPG with the following commands

```
$ gpgconf --kill gpg-agent
$ gpg-agent --daemon
```

## Starting Auth Relayer [⤴](#table-of-contents)

Start Auth Relayer in a development environment, pointed at `api.dev.magic.link`, with a hot-reloading client server:

```zsh
pnpm dev        # point to `api.dev.magic.link`
```

Start Auth Relayer in another development environment:

```zsh
pnpm prod       # point to `api.prod.magic.link`
pnpm stage      # point to `api.stagef.magic.link`
pnpm local      # point to localhost
```

#### Developing with a local backend server

Start Auth Relayer in a local environment, pointing to a local backend:

```zsh
pnpm local     # point to `localhost:8080` for end-to-end local development
pnpm local:ip  # point your local IP address for mobile access
```

To run Auth Relayer end-to-end with a local instance of the Fortmatic API:

1. Start the Fortmatic API. Follow the instructions found [here](https://github.com/fortmatic/fortmatic) if you've never done this before.

2. Now you have a version of Auth Relayer that will communicate with a backend server. Most likely you will also want a frontend to interact with Auth Relayer methods. An end-to-end test environment is built-in to the development server. You can access it at the `/e2e` endpoint. Development is pointed to port `3014` by default, so the end-to-end environment is available at [`localhost:3014/e2e`](http://localhost:3014/e2e).

#### Developing locally with a staging server

Start Auth Relayer in a local environment, pointing to a stagef endpoint in this context the (https://auth.stagef.magic.link/):

```zsh
pnpm stage
```

To run Auth Relayer end-to-end with a stagef instance of the Fortmatic API:

1. Get your `public` API key from [`https://dashboard.stagef.magic.link/`](https://dashboard.stagef.magic.link/), **PS: Make sure you have your VPN set up so you don't run into Access Errors. if you don't, check here [`VPN Setup`](https://www.notion.so/magiclabs/VPN-Setup-f6ebbe8e8126492eab030aea79e4b9d8#617216c515af4e628d4ae7947eac970e)**

2. Now you have a version of Auth Relayer that will communicate with a backend server and your staging environment. You can access it at the `/e2e` endpoint. Development is pointed to port `3014` by default, so the end-to-end environment is available at [`localhost:3014/e2e`](http://localhost:3014/e2e).

#### Developing with a local Magic SDK

Part 1: Create npm link from the library in magic-js to the npm node_modules

```
1. cd into the magic-js  folder
2. run yarn build
3. cd into types under @magic-sdk folder
4. run npm link
5. yarn build in the magic-js folder whenever you make changes
```

Part 2: Link the npm node_modules to the mandrake

```
# cd to mandrake
$ npm link magic-sdk

# Start the development server (pointing at localhost or IP):
pnpm local
pnpm dev
```

## Building & Serving for Production [⤴](#table-of-contents)

To build Auth Relayer, optimized for production:

```zsh
pnpm build
```

To serve the pre-built Auth Relayer assets:

```zsh
pnpm start
```

## Rolling Back on Production [⤴](#table-of-contents)

Follow these steps for [Rolling Back with Vercel](https://www.notion.so/magiclabs/Rollbacks-with-Vercel-423b83c94f2a4e119342637d3b7729a2)

## Testing [⤴](#table-of-contents)

The following tools encompass our testing stack:

- [`jest`](https://jestjs.io/): Test runner, assertion, and stubbing library.
- [`react testing library`](https://testing-library.com/docs/react-testing-library/intro): APIs for testing React components

Running tests:

```zsh
# Run all tests:
pnpm test

# Run a subset of tests (supports globbing):
pnpm test **/__tests__/helloWorld.spec.ts
```

## Environment Variables[⤴](#table-of-contents)

#### Secrets

**Do not put sensitive environment variables (secrets) into the .env or .env.production files!** If you have a secret env var like an secret SDK key, please add it directly to [vercel's environment variables](https://vercel.com/docs/projects/environment-variables) in the correct environment. These secrets should only be used server-side or at build time, and NOT include the `NEXT_PUBLIC_` prefix.

#### Prod

If you variable is NOT A SECRET, you can add your new variable to `.env.production` (make sure to prefix it with `NEXT_PUBLIC_` if it will be referenced client-side). Note, anything in ths file will also be used in any vercel environemt (preview, staging, dev, etc).

#### Stagef / dev / local

You will need to add it in two places.

1. Add an entry in `.env-cmdrc.js` for each of the exported objects, `dev`, `stage`, `local`, and `test`
2. Manually create new env variables in [Mandrake's Vercel Settings page](https://vercel.com/magiclabs/mandrake/settings/environment-variables) for `dev` and `stagef`

#### A note on multiple sources of environment variables

Environment variables can come from different places: .env, .env.production, env-cmdrc.js, and vercel's dashboard. Vercel should be able to merge them and override any dupes with this order of priority:

1. vercel
2. .env.production
3. .env / env-cmdrc.js

## Stagef and Dev Testing

The recommended way to test is through Vercel previews automatically created for each PR. To test on `next.stagef.magic.link` or `next.dev.magic.link` you can merge your PR into the `stagef` or `dev` branch. Merging into `main` triggers actions to reset both `stagef` and `dev` branches, and any existing changes will be wiped.

## Local Dev & Testing[⤴](#table-of-contents)

### SDK Methods[⤴](#table-of-contents)

#### Auth

- [Login with Email OTP](src/app/send/rpc/auth/magic_auth_login_with_email_otp/_docs/readme.md)

#### Wallet

-

#### User

- [Logout](src/app/send/rpc/auth/magic_auth_logout/_docs/readme.md)

##### Login with Email OTP
