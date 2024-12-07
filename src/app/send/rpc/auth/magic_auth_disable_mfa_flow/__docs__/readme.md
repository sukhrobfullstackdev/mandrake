# Disable MFA

### About

The user can navigate to this page to disable MFA. They can access this page from the user settings page, when MFA is not already turned off. The user will be prompted to enter a 6-digit code from their 2-factor authentication app. The user will then be prompted to enter a code from their authenticator app. If they don't have access to the device, they can use the recovery codes to disable MFA. Lastly, they will be shown a success message and navigated back to the settings screen.

If they don't have access to the device nor the recovery codes, they will be prompted to contact the app's customer support.
### Generic SDK Method
There is no SDK method for this flow. It can only be accessed from the User Settings page.

### RPC Methods

There are no RPC methods for this flow. It can only be accessed from the User Settings page.

### Testing

- Complete an authentication flow such as `Magic.auth.loginWithMagicLink()`.
- Call `magic.user.showSettings()`. This will send a JSON RPC request payload with a method of `magic_auth_settings`. On the UI of the settings page you can toggle MFA off if it is turned on.
