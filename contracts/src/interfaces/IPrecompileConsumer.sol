// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPrecompileConsumer {
    function _executePrecompile(address precompile, bytes memory input) external returns (bytes memory);
}
