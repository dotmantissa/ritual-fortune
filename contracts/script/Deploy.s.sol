// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {VeilOracle} from "../src/VeilOracle.sol";

interface ITEEServiceRegistry {
    struct TEEServiceNode {
        address paymentAddress;
        address teeAddress;
        uint8 teeType;
        bytes publicKey;
        string endpoint;
        bytes32 certPubKeyHash;
        uint8 capability;
    }

    struct TEEServiceContext {
        TEEServiceNode node;
        bool isValid;
        bytes32 workloadId;
    }

    function getServicesByCapability(uint8 capability, bool checkValidity)
        external
        view
        returns (TEEServiceContext[] memory);
}

contract DeployScript is Script {
    address constant TEE_SERVICE_REGISTRY = 0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        vm.startBroadcast(pk);

        VeilOracle oracle = new VeilOracle(deployer);

        address exec = vm.envAddress("EXECUTOR_ADDRESS");
        require(exec != address(0), "Missing EXECUTOR_ADDRESS");

        oracle.setExecutor(exec);
        oracle.setConvoHistory("gcs", "veil/convos/session.jsonl", "GCS_CREDS");

        console2.log("VeilOracle deployed:", address(oracle));
        console2.log("Executor:", exec);

        vm.stopBroadcast();
    }
}
