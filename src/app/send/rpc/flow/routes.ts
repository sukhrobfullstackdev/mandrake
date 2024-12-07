import { ValidRoutesConfig } from '@app/send/rpc/routes';
import { FlowRpcMethods } from '@constants/multichain-rpc-methods';

export const flowRoutes: ValidRoutesConfig = {
  [FlowRpcMethods.FLOW_GETACCOUNT]: {
    module: 'flow',
  },
  [FlowRpcMethods.FLOW_SIGNMESSAGE]: {
    module: 'flow',
  },
  [FlowRpcMethods.FLOW_SIGNTRANSACTION]: {
    module: 'flow',
  },
  [FlowRpcMethods.FLOW_COMPOSESENDTRANSACTION]: {
    module: 'flow',
  },
  [FlowRpcMethods.FLOW_COMPOSESENDUSDC]: {
    module: 'flow',
  },
};
