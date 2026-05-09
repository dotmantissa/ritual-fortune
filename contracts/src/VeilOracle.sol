// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {PrecompileConsumer} from "./PrecompileConsumer.sol";

contract VeilOracle is PrecompileConsumer, Ownable {
    address public constant LLM_INFERENCE_PRECOMPILE = 0x0000000000000000000000000000000000000802;

    uint256 public fortuneFee = 0;
    mapping(address => uint256) public fortuneCount;
    mapping(address => string) public lastFortune;
    uint256 public totalFortunes;
    address public executor;

    string public convoHistoryPlatform;
    string public convoHistoryPath;
    string public convoHistoryKeyRef;

    event FortuneRequested(address indexed seeker, uint256 indexed fortuneId, bytes32 jobId);
    event FortuneDelivered(address indexed seeker, uint256 indexed fortuneId, string fortune);
    event ExecutorUpdated(address indexed newExecutor);

    error InsufficientFee();
    error UnauthorizedDelivery();
    error NoFortunePending();

    struct PendingFortune {
        address seeker;
        uint256 fortuneId;
        bool pending;
    }

    struct StorageRef {
        string platform;
        string path;
        string keyRef;
    }

    mapping(bytes32 => PendingFortune) public pendingFortunes;
    mapping(address => bytes32) public seekerToJobId;

    constructor(address initialOwner) Ownable(initialOwner) {}

    function requestFortune(bytes calldata llmInput) external payable returns (string memory fortune) {
        if (msg.value < fortuneFee) revert InsufficientFee();
        return _requestFortuneFor(msg.sender, llmInput);
    }

    function requestFortuneFor(address seeker, bytes calldata llmInput)
        external
        payable
        onlyOwner
        returns (string memory fortune)
    {
        if (msg.value < fortuneFee) revert InsufficientFee();
        return _requestFortuneFor(seeker, llmInput);
    }

    function _requestFortuneFor(address seeker, bytes calldata llmInput) internal returns (string memory fortune) {
        totalFortunes += 1;
        fortuneCount[seeker] += 1;

        bytes memory output = _executePrecompile(LLM_INFERENCE_PRECOMPILE, llmInput);

        bytes32 jobId = keccak256(abi.encode(seeker, block.number, totalFortunes, llmInput));
        pendingFortunes[jobId] = PendingFortune(seeker, fortuneCount[seeker], true);
        seekerToJobId[seeker] = jobId;
        emit FortuneRequested(seeker, fortuneCount[seeker], jobId);

        (bool hasError, bytes memory completionData, , string memory errorMessage, ) = abi.decode(
            output,
            (bool, bytes, bytes, string, StorageRef)
        );

        require(!hasError, errorMessage);

        fortune = abi.decode(completionData, (string));
        lastFortune[seeker] = fortune;

        delete pendingFortunes[jobId];
        delete seekerToJobId[seeker];

        emit FortuneDelivered(seeker, fortuneCount[seeker], fortune);
    }

    function setExecutor(address _executor) external onlyOwner {
        executor = _executor;
        emit ExecutorUpdated(_executor);
    }

    function setConvoHistory(string calldata platform, string calldata path, string calldata keyRef) external onlyOwner {
        convoHistoryPlatform = platform;
        convoHistoryPath = path;
        convoHistoryKeyRef = keyRef;
    }

    function setFortuneFee(uint256 newFee) external onlyOwner {
        fortuneFee = newFee;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
