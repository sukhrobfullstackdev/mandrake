# Enable MFA

### About

The user can navigate to this page to enable MFA. They can access this page from the user settings page, when MFA is not already turned on. The user will be prompted to scan a QR code or to setup the 2-factor authentication using a key. The user will then be prompted to enter a code from their authenticator app to verify the setup. Lastly, they will be shown the recovery codes and prompted to save them in a safe place.

### Generic SDK Method
There is no SDK method for this flow. It can only be accessed from the User Settings page.

### RPC Methods

There are no RPC methods for this flow. It can only be accessed from the User Settings page.

### Testing

- Complete an authentication flow such as `Magic.auth.loginWithMagicLink()`.
- Call `magic.user.showSettings()`. This will send a JSON RPC request payload with a method of `magic_auth_settings`. On the UI of the settings page you can toggle MFA on if it is turned off.
