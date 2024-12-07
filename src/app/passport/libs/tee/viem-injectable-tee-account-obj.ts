import type {
  GetTransactionType,
  Hash,
  Hex,
  SerializeTransactionFn,
  SignableMessage,
  TransactionSerializable,
  TransactionSerialized,
  TypedData,
  TypedDataDefinition,
} from 'viem';

// This is a Viem LocalAccount object.
// The Magic Tee adapter must implement this interface for it to be viem compatible.
export interface IViemInjectableTeeAccountObj {
  address: Hex;
  nonceManager: undefined;
  sign?: (parameters: { hash: Hash }) => Promise<Hex>;
  signMessage: ({ message }: { message: SignableMessage }) => Promise<Hex>;
  // todo: look at how the turnkey signTransaction function handles the serializer and do the same thing.
  signTransaction: <
    serializer extends
      SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<TransactionSerializable>,
    transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
  >(
    transaction: transaction,
    options?:
      | {
          serializer?: serializer | undefined;
        }
      | undefined,
  ) => Promise<TransactionSerialized<GetTransactionType<transaction>> | Hex>;
  signTypedData: <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    parameters: TypedDataDefinition<typedData, primaryType>,
  ) => Promise<Hex>;
  source: 'custom';
  type: 'local';
  publicKey: Hex;
}
