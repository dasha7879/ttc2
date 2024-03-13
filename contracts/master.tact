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

message EndVoting {
    queryId: Int as uint64;
}

contract Master with Deployable {
    adminAddress: Address;
    priceForLike: Int as coins;
    priceForComment: Int as coins;
    votingData: VotingData;

    init(adminAddress: Address, priceForLike: Int, priceForComment: Int) {

    }

    receive(msg: ClaimPayment) {

    }

    receive(msg: StartVoting) {

    }

    receive(msg: Vote) {

    }

    receive(msg: EndVoting) {

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
