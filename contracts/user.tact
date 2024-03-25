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

    }

    receive(msg: InitUser) {

    }

    receive(msg: ChangeAvatarUrl) {

    }

    receive(msg: ChangeShortDescription) {

    }

    receive(msg: CreatePost) {

    }

    receive(msg: LikePost) {

    }

    receive(msg: CommentPost) {

    }

    receive(msg: InitVote) {

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


