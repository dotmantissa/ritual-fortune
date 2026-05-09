// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {VeilOracle} from "../src/VeilOracle.sol";

contract VeilOracleTest is Test {
    VeilOracle oracle;
    address user = address(0xBEEF);

    function setUp() public {
        oracle = new VeilOracle(address(this));
    }

    function _mockPrecompileReturn(string memory fortune) internal {
        bytes memory completionData = abi.encode(fortune);
        VeilOracle.StorageRef memory ref = VeilOracle.StorageRef("gcs", "x", "k");
        bytes memory actualOutput = abi.encode(false, completionData, bytes(""), "", ref);
        bytes memory raw = abi.encode(bytes(""), actualOutput);
        vm.mockCall(address(0x0802), bytes(""), raw);
    }

    function testCannotCallWithoutFee() public {
        oracle.setFortuneFee(1 ether);
        vm.deal(user, 1 ether);
        vm.prank(user);
        vm.expectRevert(VeilOracle.InsufficientFee.selector);
        oracle.requestFortune(bytes("0x01"));
    }

    function testFortuneDeliveredEvent() public {
        _mockPrecompileReturn("*doom*");
        vm.prank(user);
        vm.expectEmit(true, true, false, true);
        emit VeilOracle.FortuneDelivered(user, 1, "*doom*");
        oracle.requestFortune(bytes("0x01"));
    }

    function testFortureCountIncrements() public {
        _mockPrecompileReturn("first");
        vm.prank(user);
        oracle.requestFortune(bytes("0x01"));

        _mockPrecompileReturn("second");
        vm.prank(user);
        oracle.requestFortune(bytes("0x02"));

        assertEq(oracle.fortuneCount(user), 2);
    }

    function testOnlyOwnerCanSetExecutor() public {
        vm.prank(user);
        vm.expectRevert();
        oracle.setExecutor(address(0xCAFE));
    }
}
