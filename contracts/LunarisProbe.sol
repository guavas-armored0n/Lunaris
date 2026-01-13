// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LunarisProbe {
    string public constant NAME = "LunarisProbe";
    string public constant VERSION = "1.0.0";

    uint256 public pingCount;
    bytes32 public lastPingId;
    address public lastCaller;

    event Ping(address indexed caller, bytes32 indexed pingId, uint256 indexed count, string note);

    /// @notice Deterministic fingerprint for stable eth_call checks.
    function fingerprint() external pure returns (bytes32) {
        return keccak256("LUNARIS:PROBE:FINGERPRINT:V1");
    }

    /// @notice Compact snapshot for logging in scripts/tools.
    function snapshot()
        external
        view
        returns (bytes32 fp, uint256 blockNumber, uint256 timestamp, address caller, uint256 count)
    {
        return (this.fingerprint(), block.number, block.timestamp, lastCaller, pingCount);
    }

    /// @notice Optional write path for signing + explorer/indexer checks.
    function ping(string calldata note) external {
        bytes32 id = keccak256(abi.encodePacked(note, msg.sender, block.number));
        pingCount += 1;
        lastPingId = id;
        lastCaller = msg.sender;
        emit Ping(msg.sender, id, pingCount, note);
    }
}
