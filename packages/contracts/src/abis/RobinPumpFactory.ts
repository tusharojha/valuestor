export const RobinPumpFactoryABI = [
  // ============================================================================
  // Events
  // ============================================================================
  {
    type: 'event',
    name: 'TokenCreated',
    inputs: [
      { name: 'token', type: 'address', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'symbol', type: 'string', indexed: false },
      { name: 'uri', type: 'string', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TokenTraded',
    inputs: [
      { name: 'token', type: 'address', indexed: true },
      { name: 'trader', type: 'address', indexed: true },
      { name: 'isBuy', type: 'bool', indexed: false },
      { name: 'ethAmount', type: 'uint256', indexed: false },
      { name: 'tokenAmount', type: 'uint256', indexed: false },
      { name: 'newPrice', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TokenGraduated',
    inputs: [
      { name: 'token', type: 'address', indexed: true },
      { name: 'pair', type: 'address', indexed: true },
      { name: 'ethLiquidity', type: 'uint256', indexed: false },
      { name: 'tokenLiquidity', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },

  // ============================================================================
  // Write Functions
  // ============================================================================
  {
    type: 'function',
    name: 'createToken',
    stateMutability: 'payable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'uri', type: 'string' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'buyTokens',
    stateMutability: 'payable',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'sellTokens',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },

  // ============================================================================
  // Read Functions
  // ============================================================================
  {
    type: 'function',
    name: 'getBondingCurveInfo',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [
      { name: 'currentPrice', type: 'uint256' },
      { name: 'totalSupply', type: 'uint256' },
      { name: 'reserveETH', type: 'uint256' },
      { name: 'marketCap', type: 'uint256' },
      { name: 'graduated', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'getGraduationThreshold',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
