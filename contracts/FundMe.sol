//SPDX-License-Identifier: MIT

// Get funds from users
// Witdraw funds
// Set a minimum funding value in USD
// Set min fund amount in USD
//    - How to send ETH to this contract
//    1 Value transfer nonce (tx count for the account),
//    2 gas price (price per unit of gas in wei),
//    3 gas limit (21000),
//    4 to (recipient address),
//    5 value, data (empty),
//    6 v - r - s (components of tx sig)

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;

    uint256 public minimumUSD = 50 * 1e18; // 1 * 10 ** 18

    address[] public funders; // Customers/Users List Array
    mapping(address => uint256) public addressToAmountFunded;

    address public owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= minimumUSD,
            "Didn't send enough"
        ); // 1e18 == 1 * 10 ** 18 == 1000000000000000000
        // 18 decimals
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        // do onlyOwner modifier first before the rest of function withdraw()

        // (starting index; ending index; step amount)
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            // code
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        // reset the array
        funders = new address[](0);
        // actually withdraw the funds. 3 ways (transfer, send, call)

        (bool callSuccess /*bytes memory dataReturned*/, ) = payable(msg.sender)
            .call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender is not owner");
        _; // underscore represents calling the rest of the code inside function withdraw()
    }
    // transfer example
    // payable(msg.sender).transfer(address(this).balance);
    // send example
    // bool sendSuccess = payable(msg.sender.send(address(this).balance));
    // require(sendSuccess, "Send failed");
    // call
}
