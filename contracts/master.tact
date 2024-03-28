import "@stdlib/deploy";
import "./user";

struct VotingData {
    lastVoting: Int as uint32;
    votingActive: Bool;
    newPriceForLike: Int as coins;
    newPriceForComment: Int as coins;
    yesCount: Int as uint32;
    noCount: Int as uint32;
    votingStarted: Int as uint32;
}

struct MasterData {
    adminAddress: Address;
    priceForLike: Int as coins;
    priceForComment: Int as coins;
    votingData: VotingData;
}

message ClaimPayment {
    queryId: Int as uint64;
    authorAddress: Address;
    postIndex: Int as uint64;
    likesCount: Int as uint32;
    commentsCount: Int as uint32;
}

message StartVoting {
    queryId: Int as uint64;
    newPriceForLike: Int as coins;
    newPriceForComment: Int as coins;
}

message Vote {
    queryId: Int as uint64;
    vote: Bool;
    userAddress: Address;
}

message EndVoting {
    queryId: Int as uint64;
}

contract Master with Deployable {
    adminAddress: Address;
    priceForLike: Int as coins;
    priceForComment: Int as coins;
    votingData: VotingData;

    init(adminAddress: Address, priceForLike: Int, priceForComment: Int) {
        self.adminAddress = adminAddress;
        self.priceForLike = priceForLike;
        self.priceForComment = priceForComment;
        self.votingData = VotingData{
            lastVoting: 0,
            votingActive: false,
            newPriceForLike: 0,
            newPriceForComment: 0,
            yesCount: 0,
            noCount: 0,
            votingStarted: 0
        };
    }

    receive(msg: ClaimPayment) {
        let postInit: StateInit = initOf Post(myAddress(), msg.authorAddress, msg.postIndex);
        let postAddress: Address = contractAddress(postInit);
        require(postAddress == sender(), "Only the post can claim payment");
        let payment: Int = msg.likesCount * self.priceForLike + msg.commentsCount * self.priceForComment;
        send(SendParameters{
            to: msg.authorAddress,
            value: payment,
            mode: 1
        });
    }

    receive(msg: StartVoting) {
        require(self.adminAddress == sender(), "Only the admin can start voting");
        require(self.votingData.votingActive == false, "Voting is already active");
        require(self.votingData.lastVoting + 86400 < now(), "Voting can be started only once a day"); // 86400 seconds = 1 day
        self.votingData = VotingData{
            lastVoting: self.votingData.lastVoting,
            votingActive: true,
            newPriceForLike: msg.newPriceForLike,
            newPriceForComment: msg.newPriceForComment,
            yesCount: 0,
            noCount: 0,
            votingStarted: now()
        };
    }

    receive(msg: Vote) {
        require(self.votingData.votingActive, "Voting is not active");
        require(self.votingData.votingStarted + 86400 > now(), "Voting is over");
        let userInit: StateInit = initOf User(myAddress(), msg.userAddress);
        let userAddress: Address = contractAddress(userInit);
        require(userAddress == sender(), "Only the user can vote");
        if (msg.vote) {
            self.votingData.yesCount = self.votingData.yesCount + 1;
        } else {
            self.votingData.noCount = self.votingData.noCount + 1;
        }
    }

    receive(msg: EndVoting) {
        require(self.votingData.votingActive, "Voting is not active");
        require(self.votingData.votingStarted + 86400 < now(), "Voting is not over");
        if (self.votingData.yesCount > self.votingData.noCount) {
            self.priceForLike = self.votingData.newPriceForLike;
            self.priceForComment = self.votingData.newPriceForComment;
        }
        self.votingData = VotingData{
            lastVoting: now(),
            votingActive: false,
            newPriceForLike: 0,
            newPriceForComment: 0,
            yesCount: 0,
            noCount: 0,
            votingStarted: 0
        };
    }

    get fun masterData(): MasterData {
        return MasterData{
            adminAddress: self.adminAddress,
            priceForLike: self.priceForLike,
            priceForComment: self.priceForComment,
            votingData: self.votingData
        };
    }
}
