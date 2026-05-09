// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract PrecompileConsumer {
    error PrecompileCallFailed();

    function _executePrecompile(address precompile, bytes memory input) internal returns (bytes memory output) {
        (bool ok, bytes memory data) = precompile.call(input);
        if (!ok) revert PrecompileCallFailed();
        (, bytes memory actualOutput) = abi.decode(data, (bytes, bytes));
        return actualOutput;
    }
}
