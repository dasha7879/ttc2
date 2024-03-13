import "@stdlib/deploy";
import "./comment";

struct PostData {
    initialized: Bool;
    masterAddress: Address;
    authorAddress: Address;
    postIndex: Int as uint64;
    title: String;
    text: String;
    likesCount: Int as uint64;
    commentsIndex: Int as uint64;
    likesPaid: Int as uint64;
    commentsPaid: Int as uint64;
}

message InitClaimPayment {
    queryId: Int as uint64;
}

contract Post with Deployable {
    initialized: Bool;
    masterAddress: Address;
    authorAddress: Address;
    postIndex: Int as uint64;
    title: String;
    text: String;
    likesCount: Int as uint64;
    commentsIndex: Int as uint64;
    likesPaid: Int as uint64;
    commentsPaid: Int as uint64;

    init(masterAddress: Address, authorAddress: Address, postIndex: Int) {

    }


    receive(msg: InitClaimPayment) {

    }

    get fun postData(): PostData {
        return PostData{
            initialized: self.initialized,
            masterAddress: self.masterAddress,
            authorAddress: self.authorAddress,
            postIndex: self.postIndex,
            title: self.title,
            text: self.text,
            likesCount: self.likesCount,
            commentsIndex: self.commentsIndex,
            likesPaid: self.likesPaid,
            commentsPaid: self.commentsPaid
        };
    }
}
