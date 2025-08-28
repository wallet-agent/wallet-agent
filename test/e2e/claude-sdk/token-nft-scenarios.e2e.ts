import { beforeAll, describe, test } from "bun:test"
import {
  validateNFTOperation,
  validateResponseStructure,
  validateTokenOperation,
  validateWorkflow,
} from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Token and NFT Operations via Natural Language", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  beforeAll(async () => {
    // Connect wallet for token/NFT tests
    await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)
  })

  describe("ERC-20 Token Operations", () => {
    test("should handle token transfer with different phrasings", async () => {
      const transferPhrases = [
        `Send 100 USDC to ${TEST_DATA.WALLET_ADDRESS_2}`,
        `Transfer 50 USDT to ${TEST_DATA.WALLET_ADDRESS_2}`,
        `Move 25 USDC to address ${TEST_DATA.WALLET_ADDRESS_2}`,
        `Pay 10 USDC to ${TEST_DATA.WALLET_ADDRESS_2}`,
      ]

      for (const phrase of transferPhrases) {
        const result = await testPrompt(phrase, {
          toolsUsed: ["transfer_token"],
          resultContains: ["transfer", "token"],
        })

        validateTokenOperation(result, "transfer")
      }
    })

    test("should check token balances with various requests", async () => {
      const balanceQueries = [
        "What's my USDC balance?",
        "How much USDT do I have?",
        "Check my WETH balance",
        "Show me my DAI token amount",
        `What USDC balance does ${TEST_DATA.WALLET_ADDRESS_2} have?`,
      ]

      for (const query of balanceQueries) {
        const result = await testPrompt(query, {
          toolsUsed: ["get_token_balance"],
          resultContains: ["balance", "token"],
        })

        validateTokenOperation(result, "balance")
      }
    })

    test("should handle token approvals with different formats", async () => {
      const approvalRequests = [
        `Approve 1000 USDC for ${TEST_DATA.WALLET_ADDRESS_2}`,
        `Allow ${TEST_DATA.WALLET_ADDRESS_2} to spend 500 USDT`,
        `Grant unlimited USDC approval to ${TEST_DATA.WALLET_ADDRESS_2}`,
        `Set max approval for USDC to spender ${TEST_DATA.WALLET_ADDRESS_2}`,
      ]

      for (const request of approvalRequests) {
        const result = await testPrompt(request, {
          toolsUsed: ["approve_token"],
          resultContains: ["approve", "allowance"],
        })

        validateTokenOperation(result, "approve")
      }
    })

    test("should get token information with various requests", async () => {
      const infoRequests = [
        "Tell me about USDC token",
        "What are the details of USDT?",
        "Get token info for WETH",
        "Show me USDC contract information",
      ]

      for (const request of infoRequests) {
        const result = await testPrompt(request, {
          toolsUsed: ["get_token_info"],
          resultContains: ["name", "symbol", "decimals"],
        })

        validateTokenOperation(result, "info")
      }
    })
  })

  describe("Complete Token Workflows", () => {
    test("should execute complete ERC-20 interaction workflow", async () => {
      const tokenWorkflow = [
        {
          prompt: "Get information about USDC token",
          expected: {
            toolsUsed: ["get_token_info"],
            resultContains: ["usdc", "token", "info"],
          },
        },
        {
          prompt: "Check my current USDC balance",
          expected: {
            toolsUsed: ["get_token_balance"],
            resultContains: ["balance", "usdc"],
          },
        },
        {
          prompt: `Approve 100 USDC for ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: {
            toolsUsed: ["approve_token"],
            resultContains: ["approve", "usdc"],
          },
        },
        {
          prompt: `Transfer 50 USDC to ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: {
            toolsUsed: ["transfer_token"],
            resultContains: ["transfer", "usdc"],
          },
        },
      ]

      const results = await testWorkflow("Complete Token Workflow", tokenWorkflow)

      validateTokenOperation(results[0], "info")
      validateTokenOperation(results[1], "balance")
      validateTokenOperation(results[2], "approve")
      validateTokenOperation(results[3], "transfer")

      validateWorkflow(results, [
        "get_token_info",
        "get_token_balance",
        "approve_token",
        "transfer_token",
      ])
    })

    test("should handle token portfolio management", async () => {
      const portfolioManagement = `
        I want to manage my token portfolio. Check my balances for USDC, USDT, 
        and WETH. For any tokens I have, show me the token details. 
        Then prepare approval for ${TEST_DATA.WALLET_ADDRESS_2} to manage 
        100 USDC on my behalf.
      `

      const result = await testPrompt(portfolioManagement, {
        toolsUsed: ["get_token_balance", "get_token_info", "approve_token"],
        resultContains: ["portfolio", "balance", "token", "approve"],
      })

      validateResponseStructure(result)
    })
  })

  describe("NFT (ERC-721) Operations", () => {
    test("should check NFT ownership with various phrasings", async () => {
      const ownershipQueries = [
        `Who owns NFT token ID 1 in contract ${TEST_DATA.WALLET_ADDRESS_2}?`,
        `Check the owner of token 42 in NFT collection ${TEST_DATA.WALLET_ADDRESS_2}`,
        `Find out who has NFT #5 from ${TEST_DATA.WALLET_ADDRESS_2}`,
        `Get owner info for token ID 10 in contract ${TEST_DATA.WALLET_ADDRESS_2}`,
      ]

      for (const query of ownershipQueries) {
        const result = await testPrompt(query, {
          toolsUsed: ["get_nft_owner"],
          resultContains: ["owner", "nft", "token"],
        })

        validateNFTOperation(result, "owner")
      }
    })

    test("should get NFT information with different requests", async () => {
      const nftInfoRequests = [
        `Tell me about NFT collection ${TEST_DATA.WALLET_ADDRESS_2}`,
        `Get info for NFT contract ${TEST_DATA.WALLET_ADDRESS_2} token ID 1`,
        `What's the metadata for token 5 in ${TEST_DATA.WALLET_ADDRESS_2}?`,
        `Show me details of NFT ${TEST_DATA.WALLET_ADDRESS_2}`,
      ]

      for (const request of nftInfoRequests) {
        const result = await testPrompt(request, {
          toolsUsed: ["get_nft_info"],
          resultContains: ["nft", "info", "name", "symbol"],
        })

        validateNFTOperation(result, "info")
      }
    })

    test("should handle NFT transfers with various phrasings", async () => {
      const transferRequests = [
        `Transfer NFT token ID 1 from ${TEST_DATA.WALLET_ADDRESS_2} to ${TEST_DATA.WALLET_ADDRESS_1}`,
        `Send my NFT #42 to ${TEST_DATA.WALLET_ADDRESS_1}`,
        `Move token 5 from collection ${TEST_DATA.WALLET_ADDRESS_2} to ${TEST_DATA.WALLET_ADDRESS_1}`,
        `Transfer ownership of NFT token 10 to ${TEST_DATA.WALLET_ADDRESS_1}`,
      ]

      for (const request of transferRequests) {
        const result = await testPrompt(request, {
          toolsUsed: ["transfer_nft"],
          resultContains: ["transfer", "nft", "token"],
        })

        validateNFTOperation(result, "transfer")
      }
    })
  })

  describe("Complete NFT Workflows", () => {
    test("should execute complete NFT interaction workflow", async () => {
      const nftWorkflow = [
        {
          prompt: `Get information about NFT collection ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: {
            toolsUsed: ["get_nft_info"],
            resultContains: ["nft", "collection", "info"],
          },
        },
        {
          prompt: `Check who owns token ID 1 in ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: {
            toolsUsed: ["get_nft_owner"],
            resultContains: ["owner", "token"],
          },
        },
        {
          prompt: `If I own it, transfer token ID 1 to ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: {
            resultContains: ["transfer", "token", "nft"],
          },
        },
      ]

      const results = await testWorkflow("Complete NFT Workflow", nftWorkflow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle NFT collection analysis", async () => {
      const collectionAnalysis = `
        Analyze the NFT collection at ${TEST_DATA.WALLET_ADDRESS_2}. 
        Get collection info, check ownership of tokens 1, 2, and 3, 
        and provide a summary of what I can do with this collection.
      `

      const result = await testPrompt(collectionAnalysis, {
        toolsUsed: ["get_nft_info", "get_nft_owner"],
        resultContains: ["collection", "analyze", "ownership", "summary"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Mixed Token and NFT Operations", () => {
    test("should handle combined portfolio check", async () => {
      const combinedPortfolio = `
        Give me a complete digital asset overview for ${TEST_DATA.WALLET_ADDRESS_1}:
        Check ETH balance, USDC balance, and also check if I own any NFTs 
        in collection ${TEST_DATA.WALLET_ADDRESS_2} (check tokens 1-5).
      `

      const result = await testPrompt(combinedPortfolio, {
        toolsUsed: ["get_balance", "get_token_balance", "get_nft_owner"],
        resultContains: ["portfolio", "balance", "nft", "overview"],
      })

      validateResponseStructure(result)
    })

    test("should handle asset transfer preparation", async () => {
      const transferPrep = `
        I want to prepare for transferring assets. Check my USDC balance, 
        check if I own NFT token 1 in ${TEST_DATA.WALLET_ADDRESS_2}, 
        estimate gas costs for both a token transfer and NFT transfer, 
        and advise me on the order of operations.
      `

      const result = await testPrompt(transferPrep, {
        toolsUsed: ["get_token_balance", "get_nft_owner", "estimate_gas"],
        resultContains: ["balance", "nft", "gas", "transfer", "advise"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Token/NFT Error Scenarios", () => {
    test("should handle unknown token gracefully", async () => {
      const result = await testPrompt("Check my balance of UNKNOWN_TOKEN", {
        resultContains: ["unknown", "token", "not found", "error"],
      })

      validateResponseStructure(result)
    })

    test("should handle invalid NFT contract", async () => {
      const result = await testPrompt("Check who owns NFT token 1 in contract 0xinvalid", {
        errorExpected: true,
        errorMessage: "invalid",
      })

      validateResponseStructure(result)
    })

    test("should handle insufficient token balance", async () => {
      const result = await testPrompt(`Transfer 1000000 USDC to ${TEST_DATA.WALLET_ADDRESS_2}`, {
        resultContains: ["insufficient", "balance", "error"],
      })

      validateResponseStructure(result)
    })

    test("should handle NFT transfer of unowned token", async () => {
      const result = await testPrompt(
        `Transfer NFT token 999 from ${TEST_DATA.WALLET_ADDRESS_2} to ${TEST_DATA.WALLET_ADDRESS_1}`,
        {
          resultContains: ["not", "owner", "cannot", "transfer"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Token/NFT with ENS Integration", () => {
    test("should handle token transfer to ENS name", async () => {
      // Switch to mainnet for ENS
      await testPrompt("Switch to Ethereum mainnet")

      const result = await testPrompt(`Transfer 10 USDC to ${TEST_DATA.ENS_NAMES[0]}`, {
        toolsUsed: ["resolve_ens_name", "transfer_token"],
        resultContains: ["resolve", "transfer", "usdc"],
      })

      validateResponseStructure(result)
    })

    test("should handle NFT transfer to ENS name", async () => {
      await testPrompt("Switch to Ethereum mainnet")

      const result = await testPrompt(
        `Transfer NFT token 1 from ${TEST_DATA.WALLET_ADDRESS_2} to ${TEST_DATA.ENS_NAMES[0]}`,
        {
          toolsUsed: ["resolve_ens_name", "transfer_nft"],
          resultContains: ["resolve", "transfer", "nft"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Advanced Token Operations", () => {
    test("should handle token approval with max amount", async () => {
      const result = await testPrompt(
        `Approve unlimited USDC spending for ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["approve_token"],
          resultContains: ["approve", "unlimited", "max"],
        },
      )

      validateTokenOperation(result, "approve")
    })

    test("should handle multiple token operations in sequence", async () => {
      const multiTokenOps = `
        Execute this sequence: check USDC info, check my USDC balance, 
        approve 100 USDC for ${TEST_DATA.WALLET_ADDRESS_2}, then transfer 
        50 USDC to the same address.
      `

      const result = await testPrompt(multiTokenOps, {
        toolsUsed: ["get_token_info", "get_token_balance", "approve_token", "transfer_token"],
        resultContains: ["sequence", "info", "balance", "approve", "transfer"],
      })

      validateResponseStructure(result)
    })

    test("should handle conditional token operations", async () => {
      const conditionalTokens = `
        Check my USDC balance. If I have more than 100 USDC, transfer 50 to 
        ${TEST_DATA.WALLET_ADDRESS_2}. If I have less than 100, just show 
        me the balance and explain why I shouldn't transfer.
      `

      const result = await testPrompt(conditionalTokens, {
        toolsUsed: ["get_token_balance"],
        resultContains: ["balance", "condition", "transfer"],
      })

      validateResponseStructure(result)
    })
  })
})
