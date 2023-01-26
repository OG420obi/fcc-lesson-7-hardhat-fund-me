// normally we do it like this:
// imports
// main function
// calling main function

// 3 ways to write the same thing to deploy are below:

// async function deployFunc(hre) {
//     console.log("I just deployed!") // these lines = same as below, interchangeable
//     hre.getNamedAccounts()
//     hre.deployments
// }
// module.exports.default = deployFunc

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre // way to pull these two exact variables from hre
// }                                                 // same as hre.getNamedAccounts and hre.deployments

// they call this below "syntactic sugar" lol
// module.exports = async ({ getNameAccounts, deployments }) => {
//     // extrapolate those 2 vars right in the func declaration
//     // asynchronous, nameless function using arrow notation same as all those above
//     const { deploy, log } = deployments // default exporting it with module.exports
//     const { deployer } = await getNamedAccounts()
// }

const { getNamedAccounts } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    // extrapolate those 2 vars right in the func declaration
    // asynchronous, nameless function using arrow notation same as all those above

    const { deploy, log } = deployments // default exporting it with module.exports
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // example: if chainId is X use address Y
    // if chainId is Z use address A

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] // use address based on the chain we are on

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // when going for localhost or hardhat networks we want to use a mock
    // what happens when we want to change chains?
    // we need to parameterize and modularize the code so we don't have to change our addresses
    // every time we want to change chains for pulling price feeds, etc.

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("fundMe", {
        form: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("-------------------------------------------------------")
}
module.exports.tags = ["all", "fundme"]
