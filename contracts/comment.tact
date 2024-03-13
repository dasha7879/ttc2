import "@stdlib/deploy";

struct CommentData {
    initialized: Bool;
    masterAddress: Address;
    commenterAddress: Address;
    postAuthorAddress: Address;
    postIndex: Int as uint64;
    commentIndex: Int as uint64;
    text: String;
}

contract Comment with Deployable {
    initialized: Bool;
    masterAddress: Address;
    commenterAddress: Address;
    postAuthorAddress: Address;
    postIndex: Int as uint64;
    commentIndex: Int as uint64;
    text: String;

    init(masterAddress: Address, commenterAddress: Address, postAuthorAddress: Address, postIndex: Int, commentIndex: Int) {

    }

    get fun commentData(): CommentData {
        return CommentData{
            initialized: self.initialized,
            masterAddress: self.masterAddress,
            commenterAddress: self.commenterAddress,
            postAuthorAddress: self.postAuthorAddress,
            postIndex: self.postIndex,
            commentIndex: self.commentIndex,
            text: self.text
        };
    }
}
