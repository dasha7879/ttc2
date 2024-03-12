import { Blockchain, BlockchainSnapshot, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { User } from '../wrappers/User';
import { Post } from '../wrappers/Post';
import { Comment } from '../wrappers/Comment';
import { Master } from '../wrappers/Master';
import '@ton/test-utils';

describe('Task 4', () => {
    let blockchain: Blockchain;

    let masterContract: SandboxContract<Master>;
    let userContract: SandboxContract<User>;
    let postContract: SandboxContract<Post>;
    let commentContract: SandboxContract<Comment>;

    let admin: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;
    let snapshot: BlockchainSnapshot;

    const postCode = beginCell().storeUint(1, 32).endCell();
    const commentCode = beginCell().storeUint(2, 32).endCell();

    async function createPost(): Promise<void> {
        const index = (await userContract.getUserData()).postIndex;

        const result = await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'CreatePost',
                queryId: 0n,
                title: 'Test Post',
                text: 'Test Post Text',
            },
        );
        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });

        postContract = blockchain.openContract(
            Post.fromAddress(result.transactions[2].inMessage!.info.dest as Address),
        );
        expect(result.transactions).toHaveTransaction({
            from: userContract.address,
            to: postContract.address,
            deploy: true,
            success: true,
        });

        const postData = await postContract.getPostData();
        expect(postData.initialized).toBeTruthy();
        expect(postData.masterAddress).toEqualAddress(masterContract.address);
        expect(postData.authorAddress).toEqualAddress(user.address);
        expect(postData.title).toStrictEqual('Test Post');
        expect(postData.text).toStrictEqual('Test Post Text');
        expect(postData.postIndex).toStrictEqual(index);
        expect(postData.commentsIndex).toStrictEqual(0n);
        expect(postData.likesCount).toStrictEqual(0n);
        expect(postData.commentsPaid).toStrictEqual(0n);
        expect(postData.likesPaid).toStrictEqual(0n);

        const userData = await userContract.getUserData();
        expect(userData.postIndex).toStrictEqual(index + 1n);
    }

    async function likePost(): Promise<void> {
        const likesCount = (await postContract.getPostData()).likesCount;

        const result = await userContract.send(
            user.getSender(),
            {
                value: toNano('0.1'),
            },
            {
                $$type: 'LikePost',
                queryId: 0n,
                authorAddress: user.address,
                postId: 0n,
            },
        );
        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: userContract.address,
            to: postContract.address,
            success: true,
        });

        const postData = await postContract.getPostData();
        expect(postData.likesCount).toStrictEqual(likesCount + 1n);
    }

    async function commentPost(): Promise<void> {
        const commentIndex = (await postContract.getPostData()).commentsIndex;

        const result = await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'CommentPost',
                queryId: 0n,
                authorAddress: user.address,
                postId: 0n,
                text: 'Test Comment',
            },
        );
        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: userContract.address,
            to: postContract.address,
            success: true,
        });

        commentContract = blockchain.openContract(
            Comment.fromAddress(result.transactions[3].inMessage!.info.dest as Address),
        );
        expect(result.transactions).toHaveTransaction({
            from: postContract.address,
            to: commentContract.address,
            deploy: true,
            success: true,
        });

        const postData = await postContract.getPostData();
        expect(postData.commentsIndex).toStrictEqual(commentIndex + 1n);

        const commentData = await commentContract.getCommentData();
        expect(commentData.initialized).toBeTruthy();
        expect(commentData.masterAddress).toEqualAddress(masterContract.address);
        expect(commentData.commenterAddress).toEqualAddress(user.address);
        expect(commentData.postIndex).toStrictEqual(postData.postIndex);
        expect(commentData.commentIndex).toStrictEqual(commentIndex);
        expect(commentData.text).toStrictEqual('Test Comment');
    }

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        user = await blockchain.treasury('user');
        admin = await blockchain.treasury('admin');

        masterContract = blockchain.openContract(await Master.fromInit(admin.address, toNano(0.05), toNano(0.15)));
        let deployResult = await masterContract.send(
            admin.getSender(),
            {
                value: toNano('10'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: admin.address,
            to: masterContract.address,
            deploy: true,
            success: true,
        });

        userContract = blockchain.openContract(await User.fromInit(masterContract.address, user.address));

        deployResult = await userContract.send(
            user.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'InitUser',
                name: 'Test User',
                shortDescription: 'Test User Short Description',
                avatarUrl: 'https://test.com/avatar.png',
                age: 25n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            deploy: true,
            success: true,
        });

        await createPost();
        await likePost();
        await commentPost();

        snapshot = await blockchain.snapshot();
    });

    afterEach(async () => {
        blockchain.loadFrom(snapshot);
    });

    it('should deploy', async () => {
        const masterData = await masterContract.getMasterData();
        expect(masterData.adminAddress.toString()).toStrictEqual(admin.address.toString());
        expect(masterData.priceForLike).toStrictEqual(toNano(0.05));
        expect(masterData.priceForComment).toStrictEqual(toNano(0.15));
        expect(masterData.votingData.lastVoting).toStrictEqual(0n);
        expect(masterData.votingData.votingActive).toBeFalsy();
        expect(masterData.votingData.newPriceForLike).toStrictEqual(0n);
        expect(masterData.votingData.newPriceForComment).toStrictEqual(0n);
        expect(masterData.votingData.yesCount).toStrictEqual(0n);
        expect(masterData.votingData.noCount).toStrictEqual(0n);
        expect(masterData.votingData.votingStarted).toStrictEqual(0n);

        const userData = await userContract.getUserData();
        expect(userData.initialized).toBeTruthy();
        expect(userData.masterAddress.toString()).toStrictEqual(masterContract.address.toString());
        expect(userData.userAddress.toString()).toStrictEqual(user.address.toString());
        expect(userData.name.toString()).toStrictEqual('Test User');
        expect(userData.shortDescription.toString()).toStrictEqual('Test User Short Description');
        expect(userData.avatarUrl.toString()).toStrictEqual('https://test.com/avatar.png');
        expect(userData.age).toStrictEqual(25n);
        expect(userData.postIndex).toStrictEqual(1n);
    });

    afterEach(async () => {
        blockchain.loadFrom(snapshot);
    });

    it('should receive payment', async () => {
        const result = await postContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitClaimPayment',
                queryId: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: postContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: postContract.address,
            to: masterContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: masterContract.address,
            to: user.address,
            success: true,
            value: toNano(0.05 + 0.15),
        });

        const postData = await postContract.getPostData();
        expect(postData.commentsPaid).toStrictEqual(1n);
        expect(postData.likesPaid).toStrictEqual(1n);
    });

    it('should receive payment for several likes and comments', async () => {
        await likePost();
        await commentPost();
        await commentPost();

        const result = await postContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitClaimPayment',
                queryId: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: postContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: postContract.address,
            to: masterContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: masterContract.address,
            to: user.address,
            success: true,
            value: toNano(0.05 * 2 + 0.15 * 3),
        });

        const postData = await postContract.getPostData();
        expect(postData.commentsPaid).toStrictEqual(3n);
        expect(postData.likesPaid).toStrictEqual(2n);
    });

    it('should not pay twice for the same likes and comments', async () => {
        let result = await postContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitClaimPayment',
                queryId: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: postContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: postContract.address,
            to: masterContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: masterContract.address,
            to: user.address,
            success: true,
            value: toNano(0.05 + 0.15),
        });

        const postData = await postContract.getPostData();
        expect(postData.commentsPaid).toStrictEqual(1n);
        expect(postData.likesPaid).toStrictEqual(1n);

        await likePost();
        const result2 = await postContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitClaimPayment',
                queryId: 0n,
            },
        );

        expect(result2.transactions).toHaveTransaction({
            from: user.address,
            to: postContract.address,
            success: true,
        });
        expect(result2.transactions).toHaveTransaction({
            from: postContract.address,
            to: masterContract.address,
            success: true,
        });
        expect(result2.transactions).toHaveTransaction({
            from: masterContract.address,
            to: user.address,
            success: true,
            value: toNano(0.05),
        });

        const postData2 = await postContract.getPostData();

        expect(postData2.commentsPaid).toStrictEqual(1n);
        expect(postData2.likesPaid).toStrictEqual(2n);
    });

    it('should only initiate the payment by the author', async () => {
        const result = await postContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitClaimPayment',
                queryId: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: admin.address,
            to: postContract.address,
            success: false,
        });
    });

    it('should not initiate the payment if there are no new likes or comments', async () => {
        await postContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitClaimPayment',
                queryId: 0n,
            },
        );

        const result = await postContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitClaimPayment',
                queryId: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: postContract.address,
            success: false,
        });
    });

    it('should not payout when called directly', async () => {
        const result = await masterContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'ClaimPayment',
                queryId: 0n,
                authorAddress: user.address,
                commentsCount: 1n,
                likesCount: 1n,
                postIndex: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: masterContract.address,
            success: false,
        });
        expect(result.transactions).not.toHaveTransaction({
            from: masterContract.address,
            to: user.address,
            value: toNano(0.05 + 0.15),
        });

        const postData = await postContract.getPostData();
        expect(postData.commentsPaid).toStrictEqual(0n);
        expect(postData.likesPaid).toStrictEqual(0n);
    });
});
