// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BlokDepremTracker
 * @dev Smart contract for recording disaster relief predictions and shipment logs on Ethereum
 * @notice Deployed to Sepolia testnet for BlokDeprem disaster relief tracking system
 */
contract BlokDepremTracker {
    address public owner;
    address public backendAddress;

    // Existing shipment logs structure
    struct Log {
        string status;
        uint256 timestamp;
        string location;
    }

    // NEW: Prediction records structure (per PRD specification)
    struct PredictionRecord {
        bytes32 hash;        // SHA-256 hash of prediction data (gas-efficient: bytes32 vs string saves ~50% gas)
        string regionId;     // Region identifier for the prediction
        uint256 timestamp;   // Block timestamp when recorded
    }

    // Existing shipment history mapping
    mapping(string => Log[]) public shipmentHistory;

    // NEW: Prediction records storage
    mapping(uint256 => PredictionRecord) public predictionRecords;
    uint256 public predictionCount;

    // NEW: Events for blockchain transaction tracking (Story 3.2 listeners)
    event PredictionRecorded(
        uint256 indexed predictionId,
        bytes32 hash,
        string regionId,
        uint256 timestamp
    );

    event ShipmentLogged(
        string indexed barcode,
        string status,
        string location,
        uint256 timestamp
    );

    modifier onlyBackend() {
        require(msg.sender == backendAddress, "Only backend can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Sets the backend address that is authorized to call restricted functions
     * @param _backendAddress The address of the backend service wallet
     */
    function setBackendAddress(address _backendAddress) public {
        require(msg.sender == owner, "Only owner can set the backend address");
        backendAddress = _backendAddress;
    }

    /**
     * @dev Records a prediction hash on-chain with region and timestamp
     * @param _regionId The region identifier for the prediction
     * @param _hash The SHA-256 hash of the prediction data as bytes32
     * @return The prediction ID for storage reference in the backend database
     */
    function addPredictionHash(
        string memory _regionId,
        bytes32 _hash
    ) public onlyBackend returns (uint256) {
        predictionCount++;
        predictionRecords[predictionCount] = PredictionRecord({
            hash: _hash,
            regionId: _regionId,
            timestamp: block.timestamp
        });
        emit PredictionRecorded(predictionCount, _hash, _regionId, block.timestamp);
        return predictionCount;  // Store this in Prediction.blockchain_prediction_id
    }

    /**
     * @dev Retrieves a prediction record by ID
     * @param _predictionId The ID of the prediction to retrieve
     * @return The PredictionRecord containing hash, regionId, and timestamp
     */
    function getPredictionRecord(uint256 _predictionId)
        public view returns (PredictionRecord memory)
    {
        require(_predictionId > 0 && _predictionId <= predictionCount, "Invalid prediction ID");
        return predictionRecords[_predictionId];
    }

    /**
     * @dev Adds a shipment log entry for tracking
     * @param _barcode The unique barcode identifier for the shipment
     * @param _status The current status of the shipment
     * @param _location The current location of the shipment
     */
    function addShipmentLog(
        string memory _barcode,
        string memory _status,
        string memory _location
    ) public onlyBackend {
        shipmentHistory[_barcode].push(Log({
            status: _status,
            timestamp: block.timestamp,
            location: _location
        }));
        emit ShipmentLogged(_barcode, _status, _location, block.timestamp);
    }

    /**
     * @dev Retrieves all shipment logs for a given barcode
     * @param _barcode The barcode to get history for
     * @return Array of Log entries for the shipment
     */
    function getShipmentHistory(string memory _barcode)
        public view returns (Log[] memory)
    {
        return shipmentHistory[_barcode];
    }
}
