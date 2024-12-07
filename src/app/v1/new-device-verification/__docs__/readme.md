# New Device Registration / Verification

## SDK Method

This will apply to 
magic.auth.loginWithMagicLink
magic.auth.loginWithEmailOtp
Magic.auth.loginWithSMS

## Description
Our patented NDR flow will check if the user has a device registered with the email. 
If not, it will send a verification email to the user. The user will then click on the link to verify the device.

For more information, please check https://www.notion.so/magiclabs/Device-Profiling-and-Device-Verification-99eef00dea69425785b0f29ea85fdd2a?pvs=4
### Testing

1. Login in to a browser A
2. Then use the same email to login into a browser B, you will see device verification is required
