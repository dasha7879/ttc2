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

message InitComment {
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
        self.initialized = false;
        self.masterAddress = masterAddress;
        self.commenterAddress = commenterAddress;
        self.postAuthorAddress = postAuthorAddress;
        self.postIndex = postIndex;
        self.commentIndex = commentIndex;
        self.text = "";
    }

    receive(msg: InitComment) {
        let postInit: StateInit = initOf Post(self.masterAddress, self.postAuthorAddress, self.postIndex);
        let postAddress: Address = contractAddress(postInit);
        require(postAddress == sender(), "Only the post can initialize the comment");
        require(self.initialized == false, "The comment has already been initialized");
        self.text = msg.text;
        self.initialized = true;
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
