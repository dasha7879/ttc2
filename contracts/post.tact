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

message InitPost {
    title: String;
    text: String;
}

message PostLiked {
    queryId: Int as uint64;
    userAddress: Address;
}

message PostCommented {
    queryId: Int as uint64;
    userAddress: Address;
    text: String;
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
        self.initialized = false;
        self.masterAddress = masterAddress;
        self.authorAddress = authorAddress;
        self.postIndex = postIndex;
        self.title = "";
        self.text = "";
        self.likesCount = 0;
        self.commentsIndex = 0;
        self.likesPaid = 0;
        self.commentsPaid = 0;
    }

    receive(msg: InitPost) {
        let userInit: StateInit = initOf User(self.masterAddress, self.authorAddress);
        let userContractAddress: Address = contractAddress(userInit);
        require(self.initialized == false, "Post already initialized");
        require(userContractAddress == sender(), "Only author can initialize the post");
        self.initialized = true;
        self.title = msg.title;
        self.text = msg.text;
    }

    receive(msg: PostLiked) {
        let userInit: StateInit = initOf User(self.masterAddress, msg.userAddress);
        let userContractAddress: Address = contractAddress(userInit);
        require(self.initialized == true, "Post not initialized");
        require(userContractAddress == sender(), "Only user can like the post");
        self.likesCount = self.likesCount + 1;
    }

    receive(msg: PostCommented) {
        let userInit: StateInit = initOf User(self.masterAddress, msg.userAddress);
        let userContractAddress: Address = contractAddress(userInit);
        require(self.initialized == true, "Post not initialized");
        require(userContractAddress == sender(), "Only user can comment the post");
        let commentInit: StateInit = initOf Comment(self.masterAddress, msg.userAddress, self.authorAddress, self.postIndex, self.commentsIndex);
        let commentContractAddress: Address = contractAddress(commentInit);
        self.commentsIndex = self.commentsIndex + 1;
        send(SendParameters{
            to: commentContractAddress,
            value: 0,
            mode: SendRemainingValue,
            code: commentInit.code,
            data: commentInit.data,
            body: InitComment{
                text: msg.text
            }.toCell()
        });
    }

    receive(msg: InitClaimPayment) {
        require(self.authorAddress == sender(), "Only author can claim payment");
        require(self.likesPaid < self.likesCount || self.commentsPaid < self.commentsIndex, "Nothing to claim");
        send(SendParameters{
            to: self.masterAddress,
            value: 0,
            mode: SendRemainingValue,
            body: ClaimPayment{
                queryId: msg.queryId,
                authorAddress: self.authorAddress,
                postIndex: self.postIndex,
                likesCount: self.likesCount - self.likesPaid,
                commentsCount: self.commentsIndex - self.commentsPaid
            }.toCell()
        });
        self.likesPaid = self.likesCount;
        self.commentsPaid = self.commentsIndex;
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
