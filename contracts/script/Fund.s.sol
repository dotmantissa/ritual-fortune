// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

interface IRitualWallet {
    function depositFor(address user, uint256 lockDuration) external payable;
}

contract FundScript is Script {
    address constant RITUAL_WALLET = 0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address veilOracle = vm.envAddress("VEIL_ORACLE_ADDRESS");
        vm.startBroadcast(pk);

        IRitualWallet(RITUAL_WALLET).depositFor{value: 0.1 ether}(veilOracle, 1000);
        console2.log("Funded RitualWallet for", veilOracle);

        vm.stopBroadcast();
    }
}
