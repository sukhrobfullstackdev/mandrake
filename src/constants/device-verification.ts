import { createLocalJWKSet } from 'jose';

export const JWKSetForDeviceToken = createLocalJWKSet({
  keys: [
    {
      kty: 'EC',
      crv: 'P-256',
      kid: '-7vZb3_X6EGXOkUBzTGBBWaU3cmXMzvq8R3oH1tXKL8',
      use: 'sig',
      x: 'ObqQMoygDrrmiE6O7Nuq0hIpMzOKT6QCcT5ZILLeD8w',
      y: 'wvVUOQl2R9D8NHYvnTtUHNmFJY28lRvLDKdXHTFpUn0',
    },
  ],
});
