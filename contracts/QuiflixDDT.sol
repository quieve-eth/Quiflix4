// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title QuiflixDDT - Digital Distribution Token
 * @notice A hybrid Web2-Web3 system for film distribution rights management
 * Each token represents an exclusive distribution license for a specific film
 * 500 DDTs are created per approved film, distributed to qualified distributors
 */
contract QuiflixDDT is ERC1155, Ownable, Pausable {
    // ==================== CONSTANTS ====================
    uint256 public constant DDT_PER_FILM = 500;
    
    // Revenue split percentages (add up to 100)
    uint256 public constant FILMMAKER_PERCENTAGE = 70;
    uint256 public constant DISTRIBUTOR_PERCENTAGE = 20;
    uint256 public constant GOODFLIX_PERCENTAGE = 10;

    // ==================== STATE VARIABLES ====================
    
    /// @dev Counter for film IDs
    uint256 private _filmCounter = 1;
    
    /// @dev Counter for distributor IDs
    uint256 private _distributorCounter = 1;

    /// @dev Film data structure
    struct Film {
        uint256 filmId;
        string title;
        address filmmaker;
        string filmHash; // IPFS hash of film metadata
        uint256 createdAt;
        bool approved;
        uint256 totalSalesValue; // in wei
    }

    /// @dev Distributor data structure
    struct Distributor {
        uint256 distributorId;
        address walletAddress;
        string companyName;
        uint256[] heldFilmIds; // Array of film IDs where they hold DDTs
        uint256 totalEarnings; // in wei
        uint256 joinedAt;
    }

    /// @dev DDT holding structure
    struct DDTHolding {
        uint256 filmId;
        uint256 balance; // Number of DDTs held
        uint256 salesAttributed; // Total sales value attributed to this distributor's DDTs
        uint256 earnedAmount; // Total earnings from sales
    }

    /// @dev Sale record structure
    struct Sale {
        uint256 filmId;
        uint256 ddtId; // Token ID (filmId * 1000 + ddt number)
        address distributor;
        uint256 saleAmount;
        uint256 timestamp;
    }

    // ==================== MAPPINGS ====================
    
    /// @dev filmId => Film details
    mapping(uint256 => Film) public films;
    
    /// @dev distributorId => Distributor details
    mapping(uint256 => Distributor) public distributors;
    
    /// @dev distributorAddress => distributorId
    mapping(address => uint256) public addressToDistributorId;
    
    /// @dev filmId => filmmakerAddress
    mapping(uint256 => address) public filmToFilmmaker;
    
    /// @dev filmId => total revenue accumulated
    mapping(uint256 => uint256) public filmRevenue;
    
    /// @dev distributorId => filmId => DDTHolding details
    mapping(uint256 => mapping(uint256 => DDTHolding)) public distributorHoldings;
    
    /// @dev Sales history for tracking
    Sale[] public salesHistory;
    
    /// @dev Goodflix wallet address for receiving platform fees
    address public goodflixWallet;

    // ==================== EVENTS ====================
    
    event FilmRegistered(uint256 indexed filmId, string title, address filmmaker);
    event FilmApproved(uint256 indexed filmId, string title);
    event DistributorRegistered(uint256 indexed distributorId, address wallet, string companyName);
    event DDTAssigned(uint256 indexed filmId, uint256 indexed distributorId, uint256 amount);
    event SaleRecorded(uint256 indexed filmId, uint256 indexed distributorId, uint256 saleAmount);
    event RevenuePaid(uint256 indexed filmId, uint256 indexed distributorId, uint256 filmakerAmount, uint256 distributorAmount, uint256 goodflixAmount);

    // ==================== MODIFIERS ====================
    
    modifier onlyFilmmaker(uint256 filmId) {
        require(films[filmId].filmmaker == msg.sender, "Only filmmaker can call this");
        _;
    }

    modifier filmExists(uint256 filmId) {
        require(films[filmId].filmmaker != address(0), "Film does not exist");
        _;
    }

    modifier distributorExists(uint256 distributorId) {
        require(distributors[distributorId].walletAddress != address(0), "Distributor does not exist");
        _;
    }

    // ==================== CONSTRUCTOR ====================
    
    constructor(address _goodflixWallet) ERC1155("ipfs://QmQuiflix/{id}.json") {
        goodflixWallet = _goodflixWallet;
    }

    // ==================== FILM MANAGEMENT ====================
    
    /**
     * @notice Register a new film (called by platform after filmmaker approval)
     * @param _title Film title
     * @param _filmmaker Filmmaker wallet address
     * @param _filmHash IPFS hash of film metadata
     */
    function registerFilm(
        string memory _title,
        address _filmmaker,
        string memory _filmHash
    ) external onlyOwner returns (uint256) {
        uint256 filmId = _filmCounter++;
        
        films[filmId] = Film({
            filmId: filmId,
            title: _title,
            filmmaker: _filmmaker,
            filmHash: _filmHash,
            createdAt: block.timestamp,
            approved: false,
            totalSalesValue: 0
        });
        
        filmToFilmmaker[filmId] = _filmmaker;
        
        emit FilmRegistered(filmId, _title, _filmmaker);
        return filmId;
    }

    /**
     * @notice Approve a film and mint initial DDT pool
     * @param _filmId Film ID to approve
     */
    function approveFilmAndMintDDTs(uint256 _filmId) external onlyOwner filmExists(_filmId) {
        require(!films[_filmId].approved, "Film already approved");
        
        films[_filmId].approved = true;
        
        // Mint 500 DDTs for this film to the contract (held by Goodflix initially)
        uint256 tokenId = _filmId * 1000; // Token ID = filmId * 1000
        _mint(address(this), tokenId, DDT_PER_FILM, "");
        
        emit FilmApproved(_filmId, films[_filmId].title);
    }

    // ==================== DISTRIBUTOR MANAGEMENT ====================
    
    /**
     * @notice Register a distributor (called by platform after distributor approval)
     * @param _walletAddress Distributor's wallet address
     * @param _companyName Company name
     */
    function registerDistributor(
        address _walletAddress,
        string memory _companyName
    ) external onlyOwner returns (uint256) {
        require(addressToDistributorId[_walletAddress] == 0, "Distributor already registered");
        
        uint256 distributorId = _distributorCounter++;
        
        distributors[distributorId] = Distributor({
            distributorId: distributorId,
            walletAddress: _walletAddress,
            companyName: _companyName,
            heldFilmIds: new uint256[](0),
            totalEarnings: 0,
            joinedAt: block.timestamp
        });
        
        addressToDistributorId[_walletAddress] = distributorId;
        
        emit DistributorRegistered(distributorId, _walletAddress, _companyName);
        return distributorId;
    }

    /**
     * @notice Assign 1 DDT to an approved distributor for a specific film
     * @param _filmId Film ID
     * @param _distributorId Distributor ID
     */
    function assignDDTToDistributor(uint256 _filmId, uint256 _distributorId) 
        external 
        onlyOwner 
        filmExists(_filmId) 
        distributorExists(_distributorId) 
    {
        require(films[_filmId].approved, "Film must be approved first");
        
        uint256 tokenId = _filmId * 1000;
        address distributorWallet = distributors[_distributorId].walletAddress;
        
        // Transfer 1 DDT from contract to distributor
        safeTransferFrom(address(this), distributorWallet, tokenId, 1, "");
        
        // Update holding records
        if (distributorHoldings[_distributorId][_filmId].balance == 0) {
            distributors[_distributorId].heldFilmIds.push(_filmId);
        }
        distributorHoldings[_distributorId][_filmId].balance += 1;
        distributorHoldings[_distributorId][_filmId].filmId = _filmId;
        
        emit DDTAssigned(_filmId, _distributorId, 1);
    }

    // ==================== SALES & REVENUE ====================
    
    /**
     * @notice Record a sale made through a distributor's link
     * Only authorized to record sales from the web2 platform backend
     * @param _filmId Film ID
     * @param _distributorId Distributor ID
     * @param _saleAmount Sale amount in wei
     */
    function recordSaleAndDistributeRevenue(
        uint256 _filmId,
        uint256 _distributorId,
        uint256 _saleAmount
    ) external onlyOwner filmExists(_filmId) distributorExists(_distributorId) {
        require(distributorHoldings[_distributorId][_filmId].balance > 0, "Distributor holds no DDTs for this film");
        require(_saleAmount > 0, "Sale amount must be > 0");
        
        // Record sale
        uint256 tokenId = _filmId * 1000;
        salesHistory.push(Sale({
            filmId: _filmId,
            ddtId: tokenId,
            distributor: distributors[_distributorId].walletAddress,
            saleAmount: _saleAmount,
            timestamp: block.timestamp
        }));
        
        // Calculate splits
        uint256 filemakerEarnings = (_saleAmount * FILMMAKER_PERCENTAGE) / 100;
        uint256 distributorEarnings = (_saleAmount * DISTRIBUTOR_PERCENTAGE) / 100;
        uint256 goodflixEarnings = (_saleAmount * GOODFLIX_PERCENTAGE) / 100;
        
        // Update balances
        films[_filmId].totalSalesValue += _saleAmount;
        filmRevenue[_filmId] += _saleAmount;
        
        distributorHoldings[_distributorId][_filmId].salesAttributed += _saleAmount;
        distributorHoldings[_distributorId][_filmId].earnedAmount += distributorEarnings;
        distributors[_distributorId].totalEarnings += distributorEarnings;
        
        emit SaleRecorded(_filmId, _distributorId, _saleAmount);
        emit RevenuePaid(_filmId, _distributorId, filemakerEarnings, distributorEarnings, goodflixEarnings);
        
        // Note: Actual ETH transfers would be handled by payment router contract
        // This contract tracks entitlements; payment processing is separate
    }

    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @notice Get all films
     */
    function getFilmsCount() external view returns (uint256) {
        return _filmCounter - 1;
    }

    /**
     * @notice Get film details
     */
    function getFilm(uint256 _filmId) external view returns (Film memory) {
        return films[_filmId];
    }

    /**
     * @notice Get distributor details
     */
    function getDistributor(uint256 _distributorId) external view returns (Distributor memory) {
        return distributors[_distributorId];
    }

    /**
     * @notice Get distributor by wallet address
     */
    function getDistributorByAddress(address _wallet) external view returns (Distributor memory) {
        uint256 distributorId = addressToDistributorId[_wallet];
        return distributors[distributorId];
    }

    /**
     * @notice Get distributor holdings for a specific film
     */
    function getDistributorHoldings(uint256 _distributorId, uint256 _filmId) 
        external 
        view 
        returns (DDTHolding memory) 
    {
        return distributorHoldings[_distributorId][_filmId];
    }

    /**
     * @notice Get all films a distributor holds DDTs for
     */
    function getDistributorFilms(uint256 _distributorId) external view returns (uint256[] memory) {
        return distributors[_distributorId].heldFilmIds;
    }

    /**
     * @notice Get sales history
     */
    function getSalesHistoryCount() external view returns (uint256) {
        return salesHistory.length;
    }

    /**
     * @notice Get a specific sale record
     */
    function getSale(uint256 _index) external view returns (Sale memory) {
        require(_index < salesHistory.length, "Invalid sale index");
        return salesHistory[_index];
    }

    /**
     * @notice Get revenue for a film
     */
    function getFilmRevenue(uint256 _filmId) external view returns (uint256) {
        return filmRevenue[_filmId];
    }

    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @notice Update Goodflix wallet address
     */
    function setGoodflixWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        goodflixWallet = _newWallet;
    }

    /**
     * @notice Pause contract in case of emergency
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ==================== MANDATORY OVERRIDES ====================
    
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override
        whenNotPaused
    {
        super._update(from, to, ids, values);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return super.uri(tokenId);
    }
}
