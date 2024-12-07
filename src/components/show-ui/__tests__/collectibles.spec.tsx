import Collectibles from '@components/show-ui/collectibles';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const MOCK_PUBLIC_ADDRESS = '0x32Bc179E3Da8912F2C85bCBAd5dAF6D45Ce82c63';

const MOCK_SPAM_NFT_ARRAY: any = [
  {
    contract: {
      address: '0xBfe90357eaC1E66778dcFf56d427146b17293f94',
      tokenType: 'ERC1155',
      isSpam: true,
    },
    name: 'MAGIC_SPAM',
    tokenType: 'ERC1155',
    image: {
      cachedUrl: '',
      originalUrl: '',
    },
    tokenId: '2',
    balance: '3',
  },
];

const MOCK_OWNED_NFT_ARRAY: any = [
  {
    contract: {
      address: '0xBfe90357eaC1E66778dcFf56d427146b17293f94',
      tokenType: 'ERC1155',
      contractDeployer: '0x2CBC8df69CA34F26Db371fb9380c90Ab91bd7A55',
      deployedBlockNumber: 5461219,
      openSeaMetadata: {},
      spamClassifications: [],
      isSpam: false,
    },
    tokenId: '2',
    tokenType: 'ERC1155',
    name: 'Magic x KBW',
    description: 'Free commemorative open edition from Magic’s NFT minting demo at Korea Blockchain Week(KBW).',
    tokenUri:
      'https://bafybeibv4wkptfxj5xoi6cwtrmfuf3h3v4asondzkzqn5m4qnqcfzdofzu.ipfs.dweb.link/0000000000000000000000000000000000000000000000000000000000000001.json',
    image: {
      cachedUrl: 'https://bafybeia2y4jr6hbccb5rtnnbhieu3rvzz6vbodycx7l4bi2a7qy4txml3i.ipfs.dweb.link',
      originalUrl: 'https://bafybeia2y4jr6hbccb5rtnnbhieu3rvzz6vbodycx7l4bi2a7qy4txml3i.ipfs.dweb.link',
    },
    raw: {
      tokenUri:
        'https://bafybeibv4wkptfxj5xoi6cwtrmfuf3h3v4asondzkzqn5m4qnqcfzdofzu.ipfs.dweb.link/0000000000000000000000000000000000000000000000000000000000000001.json',
      metadata: {
        name: 'Magic x KBW',
        description: 'Free commemorative open edition from Magic’s NFT minting demo at Korea Blockchain Week(KBW).',
        image: 'https://bafybeia2y4jr6hbccb5rtnnbhieu3rvzz6vbodycx7l4bi2a7qy4txml3i.ipfs.dweb.link',
        external_url: 'https://magic.link',
        attributes: [
          {
            value: 'Lotte World Tower',
            trait_type: 'Landmark',
          },
          {
            value: '37.5125° N',
            trait_type: 'Latitude',
          },
          {
            value: '127.1025° E',
            trait_type: 'Longitude',
          },
          {
            value: 'KBW',
            trait_type: 'Event',
          },
        ],
      },
    },
    mint: {
      mintAddress: '0x94f1e7d2db1768badc31932d6f21d991879ba112',
      blockNumber: 5953047,
      timestamp: '2024-05-22T06:49:00Z',
      transactionHash: '0xa0ac17a6ca59e36a4e09d3c6632b1ae58bd61bd1fa331f43eaa104566a478c27',
    },
    timeLastUpdated: '2024-03-11T05:41:26.876Z',
    balance: '6',
    acquiredAt: {},
  },
];

const mockUseUserMetadata = jest.fn();

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@constants/alchemy', () => ({
  ALCHEMY_KEYS: {
    'Sepolia Testnet': 'abcdef',
  },
}));

jest.mock('@hooks/common/user-metadata', () => ({
  useUserMetadata: () => mockUseUserMetadata(),
}));

mockUseUserMetadata.mockImplementation(() => ({
  userMetadata: {
    publicAddress: MOCK_PUBLIC_ADDRESS,
  },
}));

jest.mock('@hooks/common/chain-info', () => ({
  useChainInfo: jest.fn(() => ({
    chainInfo: {
      networkName: 'Sepolia Testnet',
    },
  })),
}));

function setupEmptyArray() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <Collectibles nfts={[]} />
    </QueryClientProvider>,
  );
}

function setupSpamArray() {
  const queryClient = new QueryClient(TEST_CONFIG);

  queryClient.setQueryData(
    [
      'nft-image',
      {
        contractAddress: '0xBfe90357eaC1E66778dcFf56d427146b17293f94',
        tokenId: '2',
        tokenType: 'ERC1155',
      },
    ],
    'https://bafybeia2y4jr6hbccb5rtnnbhieu3rvzz6vbodycx7l4bi2a7qy4txml3i.ipfs.dweb.link',
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <Collectibles nfts={MOCK_SPAM_NFT_ARRAY} />
    </QueryClientProvider>,
  );
}

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <Collectibles nfts={MOCK_OWNED_NFT_ARRAY} />
    </QueryClientProvider>,
  );
}

describe('Collectibles', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render one child in the grid', () => {
    setup();

    const content = screen.getByRole('grid');
    const children = content.children;
    expect(children.length).toBe(1);
  });

  it('should render nft-placeholder', () => {
    setupEmptyArray();

    const content = screen.getByText('No digital collectibles... Yet');
    expect(content).toBeInTheDocument();
  });

  it('should render spam nft', () => {
    setupSpamArray();

    const button = screen.getByRole('button');
    act(() => button.click());
    expect(screen.getByAltText('MAGIC_SPAM')).toBeInTheDocument();

    act(() => button.click());
    expect(screen.queryByAltText('MAGIC_SPAM')).toBeNull();
  });
});
