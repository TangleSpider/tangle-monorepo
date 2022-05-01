export default [
	{
		"inputs": [
			{
				"components": [
					{
						"components": [
							{
								"internalType": "address",
								"name": "proposer",
								"type": "address"
							},
							{
								"internalType": "uint256",
								"name": "party",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "fee",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "time",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "cost",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "work",
								"type": "uint256"
							}
						],
						"internalType": "struct Proposal",
						"name": "proposal",
						"type": "tuple"
					},
					{
						"internalType": "uint256",
						"name": "party",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "fee",
						"type": "uint256"
					}
				],
				"internalType": "struct Acceptance",
				"name": "acceptance",
				"type": "tuple"
			}
		],
		"name": "accept",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "bytes32[]",
						"name": "works",
						"type": "bytes32[]"
					},
					{
						"internalType": "bytes32[]",
						"name": "trades",
						"type": "bytes32[]"
					},
					{
						"internalType": "bool[]",
						"name": "decisions",
						"type": "bool[]"
					},
					{
						"internalType": "uint256",
						"name": "nonce",
						"type": "uint256"
					}
				],
				"internalType": "struct Work",
				"name": "work",
				"type": "tuple"
			}
		],
		"name": "moil",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "proposer",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "party",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "fee",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "time",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "cost",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "work",
						"type": "uint256"
					}
				],
				"internalType": "struct Proposal",
				"name": "proposal",
				"type": "tuple"
			},
			{
				"internalType": "bytes",
				"name": "goods",
				"type": "bytes"
			}
		],
		"name": "propose",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	}
]
