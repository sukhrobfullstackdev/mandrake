/**
 * @jest-environment node
 */
// Note that setting the jest-environment to node above is required for testing Next API routes
// we disable the following because we're not picking the variable names like "error_code" these are from the system

import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { PassportSmartAccount } from '@hooks/passport/use-smart-account';
import { HttpService } from '@lib/http-services';
import { newtonSepolia } from 'magic-passport/networks';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('success', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn()); // expected to be called in the handler
    jest.spyOn(console, 'warn').mockImplementation(jest.fn()); // expected to be called in createNextErrorResponse()
  });
  it('should return data with status 200 if enable cab and associate user with wallet is successful', async () => {
    const expectedData = { success: true };
    // mock passport service request to return undefined
    jest
      .spyOn(HttpService.PassportIdentity, 'Patch')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData))));
    jest.spyOn(KernelClientService, 'enableCab').mockImplementation(
      jest.fn(
        () =>
          new Promise(res => {
            res();
          }),
      ),
    );
    jest
      .spyOn(KernelClientService, 'getSmartAccount')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData as unknown as PassportSmartAccount))));

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        eoaPublicAddress: '0x',
        accessToken: '0x',
        network: newtonSepolia,
      }),
    } as unknown as NextRequest);
    const body = await response.json();
    const { data } = body;

    expect(response.status).toBe(200);
    expect(data).toEqual(expectedData);
  });
});

describe('failure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(jest.fn()); // expected to be called in the handler
    jest.spyOn(console, 'warn').mockImplementation(jest.fn()); // expected to be called in createNextErrorResponse()
  });
  it('should return error with status 400 if eoaPublicAddress param is not there', async () => {
    const expectedData = { success: true };
    // mock passport service request to return undefined
    jest
      .spyOn(HttpService.PassportIdentity, 'Patch')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData))));
    jest.spyOn(KernelClientService, 'enableCab').mockImplementation(
      jest.fn(
        () =>
          new Promise(res => {
            res();
          }),
      ),
    );
    jest
      .spyOn(KernelClientService, 'getSmartAccount')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData as unknown as PassportSmartAccount))));

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        eoaPublicAddress: undefined,
        accessToken: '0x',
        network: newtonSepolia,
      }),
    } as unknown as NextRequest);
    const body = await response.json();
    const { data } = body;

    expect(response.status).toBe(400);
    expect(data).toEqual(null);
  });
  it('should return error with status 400 if accessToken param is not there', async () => {
    const expectedData = { success: true };
    // mock passport service request to return undefined
    jest
      .spyOn(HttpService.PassportIdentity, 'Patch')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData))));
    jest.spyOn(KernelClientService, 'enableCab').mockImplementation(
      jest.fn(
        () =>
          new Promise(res => {
            res();
          }),
      ),
    );
    jest
      .spyOn(KernelClientService, 'getSmartAccount')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData as unknown as PassportSmartAccount))));

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        eoaPublicAddress: '0x',
        accessToken: undefined,
        network: newtonSepolia,
      }),
    } as unknown as NextRequest);
    const body = await response.json();
    const { data } = body;

    expect(response.status).toBe(400);
    expect(data).toEqual(null);
  });
  it('should return error with status 400 if network param is not there', async () => {
    const expectedData = { success: true };
    // mock passport service request to return undefined
    jest
      .spyOn(HttpService.PassportIdentity, 'Patch')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData))));
    jest.spyOn(KernelClientService, 'enableCab').mockImplementation(
      jest.fn(
        () =>
          new Promise(res => {
            res();
          }),
      ),
    );
    jest
      .spyOn(KernelClientService, 'getSmartAccount')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData as unknown as PassportSmartAccount))));

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        eoaPublicAddress: '0x',
        accessToken: '0x',
        network: undefined,
      }),
    } as unknown as NextRequest);
    const body = await response.json();
    const { data } = body;

    expect(response.status).toBe(400);
    expect(data).toEqual(null);
  });
  it('should return error with status 500 if getSmartAccount fails', async () => {
    const expectedData = { success: true };
    // mock passport service request to return undefined
    jest
      .spyOn(HttpService.PassportIdentity, 'Patch')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData))));
    jest.spyOn(KernelClientService, 'enableCab').mockImplementation(
      jest.fn(
        () =>
          new Promise(res => {
            res();
          }),
      ),
    );
    jest.spyOn(KernelClientService, 'getSmartAccount').mockImplementation(
      jest.fn(
        () =>
          new Promise((_, rej) => {
            rej(new Error());
          }),
      ),
    );

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        eoaPublicAddress: '0x',
        accessToken: '0x',
        network: newtonSepolia,
      }),
    } as unknown as NextRequest);
    const body = await response.json();
    const { data } = body;

    expect(response.status).toBe(500);
    expect(data).toEqual(null);
  });
  it('should return error with status 500 if getSmartAccount return falsy value', async () => {
    const expectedData = { success: true };
    // mock passport service request to return undefined
    jest
      .spyOn(HttpService.PassportIdentity, 'Patch')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData))));
    jest.spyOn(KernelClientService, 'enableCab').mockImplementation(
      jest.fn(
        () =>
          new Promise(res => {
            res();
          }),
      ),
    );
    jest.spyOn(KernelClientService, 'getSmartAccount').mockImplementation(
      jest.fn(
        () =>
          new Promise(res => {
            res(null as unknown as PassportSmartAccount);
          }),
      ),
    );

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        eoaPublicAddress: '0x',
        accessToken: '0x',
        network: newtonSepolia,
      }),
    } as unknown as NextRequest);
    const body = await response.json();
    const { data } = body;

    expect(response.status).toBe(500);
    expect(data).toEqual(null);
  });
  it('should return error with status 500 if enableCab fails', async () => {
    const expectedData = { success: true };
    // mock passport service request to return undefined
    jest
      .spyOn(HttpService.PassportIdentity, 'Patch')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData))));
    jest.spyOn(KernelClientService, 'enableCab').mockImplementation(
      jest.fn(() => {
        throw new Error();
      }),
    );
    jest
      .spyOn(KernelClientService, 'getSmartAccount')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData as unknown as PassportSmartAccount))));

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        eoaPublicAddress: '0x',
        accessToken: '0x',
        network: newtonSepolia,
      }),
    } as unknown as NextRequest);

    expect(response.status).toBe(500);
  });
  it('should return error with status 500 if associate user with wallet fails', async () => {
    const expectedData = { success: true };
    // mock passport service request to return undefined
    jest.spyOn(HttpService.PassportIdentity, 'Patch').mockImplementation(
      jest.fn(
        () =>
          new Promise((_, rej) => {
            rej(new Error());
          }),
      ),
    );
    jest.spyOn(KernelClientService, 'enableCab').mockImplementation(
      jest.fn(
        () =>
          new Promise(res => {
            res();
          }),
      ),
    );
    jest
      .spyOn(KernelClientService, 'getSmartAccount')
      .mockImplementation(jest.fn(() => new Promise(res => res(expectedData as unknown as PassportSmartAccount))));

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        eoaPublicAddress: '0x',
        accessToken: '0x',
        network: newtonSepolia,
      }),
    } as unknown as NextRequest);

    expect(response.status).toBe(500);
  });
});
