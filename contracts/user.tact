import "@stdlib/deploy";
import "./post";

struct UserData {
    initialized: Bool;
    masterAddress: Address;
    userAddress: Address;
    name: String;
    avatarUrl: String;
    shortDescription: String;
    age: Int as uint8;
    postIndex: Int as uint64;
}

message InitUser {
    name: String;
    avatarUrl: String;
    shortDescription: String;
    age: Int as uint8;
}

message ChangeAvatarUrl {
    queryId: Int as uint64;
    avatarUrl: String;
}

message ChangeShortDescription {
    queryId: Int as uint64;
    shortDescription: String;
}

message CreatePost {
    queryId: Int as uint64;
    title: String;
    text: String;
}

message LikePost {
    queryId: Int as uint64;
    authorAddress: Address;
    postId: Int as uint64;
}

message CommentPost {
    queryId: Int as uint64;
    authorAddress: Address;
    postId: Int as uint64;
    text: String;
}

message InitVote {
    queryId: Int as uint64;
    vote: Bool;
}

contract User {
    initialized: Bool;
    masterAddress: Address;
    userAddress: Address;
    name: String;
    avatarUrl: String;
    shortDescription: String;
    age: Int as uint8;
    postIndex: Int as uint64;

    init(masterAddress: Address, userAddress: Address) {
        self.masterAddress = masterAddress;
        self.userAddress = userAddress;
        self.name = "";
        self.avatarUrl = "";
        self.shortDescription = "";
        self.age = 0;
        self.postIndex = 0;
        self.initialized = false;
    }

    receive(msg: InitUser) {
        require(self.initialized == false, "User already initialized");
        require(self.userAddress == sender(), "Only the owner can initialize itself");
        self.name = msg.name;
        self.avatarUrl = msg.avatarUrl;
        self.shortDescription = msg.shortDescription;
        self.age = msg.age;
        self.initialized = true;
    }

    receive(msg: ChangeAvatarUrl) {
        require(self.userAddress == sender(), "Only the owner can change its avatar");
        self.avatarUrl = msg.avatarUrl;
    }

    receive(msg: ChangeShortDescription) {
        require(self.userAddress == sender(), "Only the owner can change its short description");
        self.shortDescription = msg.shortDescription;
    }

    receive(msg: CreatePost) {
        require(self.userAddress == sender(), "Only the owner can create a post");
        let postInit: StateInit = initOf Post(self.masterAddress, self.userAddress, self.postIndex);
        let postAddress: Address = contractAddress(postInit);
        self.postIndex = self.postIndex + 1;
        send(SendParameters{
            to: postAddress,
            value: 0,
            mode: SendRemainingValue,
            code: postInit.code,
            data: postInit.data,
            body: InitPost{
                title: msg.title,
                text: msg.text
            }.toCell()
        });
    }

    receive(msg: LikePost) {
        require(self.userAddress == sender(), "Only the owner can like a post");
        let postInit: StateInit = initOf Post(self.masterAddress, msg.authorAddress, msg.postId);
        let postAddress: Address = contractAddress(postInit);
        send(SendParameters{
            to: postAddress,
            value: 0,
            mode: SendRemainingValue,
            body: PostLiked{
                queryId: msg.queryId,
                userAddress: self.userAddress
            }.toCell()
        });
    }

    receive(msg: CommentPost) {
        require(self.userAddress == sender(), "Only the owner can comment a post");
        let postInit: StateInit = initOf Post(self.masterAddress, msg.authorAddress, msg.postId);
        let postAddress: Address = contractAddress(postInit);
        send(SendParameters{
            to: postAddress,
            value: 0,
            mode: SendRemainingValue,
            body: PostCommented{
                queryId: msg.queryId,
                userAddress: self.userAddress,
                text: msg.text
            }.toCell()
        });
    }

    receive(msg: InitVote) {
        require(self.userAddress == sender(), "Only the owner can vote");
        send(SendParameters{
            to: self.masterAddress,
            value: 0,
            mode: SendRemainingValue,
            body: Vote{
                queryId: msg.queryId,
                vote: msg.vote,
                userAddress: self.userAddress
            }.toCell()
        });
    }

    get fun userData(): UserData {
        return UserData{
            initialized: self.initialized,
            masterAddress: self.masterAddress,
            userAddress: self.userAddress,
            name: self.name,
            avatarUrl: self.avatarUrl,
            shortDescription: self.shortDescription,
            age: self.age,
            postIndex: self.postIndex
        };
    }
}


