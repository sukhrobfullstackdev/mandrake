/* istanbul ignore file */
import { MagicMethodEventData } from '@custom-types/rpc';
import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export abstract class PayloadRouter {
  constructor(
    protected readonly router: AppRouterInstance,
    protected flags?: LDFlagSet,
  ) {}

  abstract route(messageData: MagicMethodEventData): void;

  abstract routeIntermediaryEvent(messageData: MagicMethodEventData): void;
}
