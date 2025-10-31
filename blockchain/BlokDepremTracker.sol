// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlokDepremTracker {
    address public owner;
    address public backendAddress;

    struct Log {
        string status;
        uint256 timestamp;
        string location;
    }

    mapping(string => Log[]) public shipmentHistory;

    modifier onlyBackend() {
        require(msg.sender == backendAddress, "Only backend can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setBackendAddress(address _backendAddress) public {
        require(msg.sender == owner, "Only owner can set the backend address");
        backendAddress = _backendAddress;
    }

    function addShipmentLog(string memory _barcode, string memory _status, string memory _location) public onlyBackend {
        shipmentHistory[_barcode].push(Log({status: _status, timestamp: block.timestamp, location: _location}));
    }

    function getShipmentHistory(string memory _barcode) public view returns (Log[] memory) {
        return shipmentHistory[_barcode];
    }
}
