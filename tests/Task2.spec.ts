import { Blockchain, BlockchainSnapshot, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { User } from '../wrappers/User';
import { Post } from '../wrappers/Post';
import '@ton/test-utils';

describe('Task 2', () => {
    let blockchain: Blockchain;

    let userContract: SandboxContract<User>;
    let postContract: SandboxContract<Post>;

    let master: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;
    let secondUser: SandboxContract<TreasuryContract>;
    let snapshot: BlockchainSnapshot;

    const postCode = beginCell().storeUint(1, 32).endCell();
    const commentCode = beginCell().storeUint(2, 32).endCell();

    beforeAll(async () => {
        blockchain = await Blockchain.create();

        master = await blockchain.treasury('master');
        user = await blockchain.treasury('user');
        secondUser = await blockchain.treasury('secondUser');
        userContract = blockchain.openContract(await User.fromInit(master.address, user.address));

        const deployResult = await userContract.send(
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

        snapshot = await blockchain.snapshot();
    });

    afterEach(async () => {
        blockchain.loadFrom(snapshot);
    });

    it('should create post', async () => {
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
        expect(postData.masterAddress).toEqualAddress(master.address);
        expect(postData.authorAddress).toEqualAddress(user.address);
        expect(postData.title).toStrictEqual('Test Post');
        expect(postData.text).toStrictEqual('Test Post Text');
        expect(postData.postIndex).toStrictEqual(0n);
        expect(postData.commentsIndex).toStrictEqual(0n);
        expect(postData.likesCount).toStrictEqual(0n);
        expect(postData.commentsPaid).toStrictEqual(0n);
        expect(postData.likesPaid).toStrictEqual(0n);

        const userData = await userContract.getUserData();
        expect(userData.postIndex).toStrictEqual(1n);
    });

    it('should only allow user to create post', async () => {
        const result = await userContract.send(
            secondUser.getSender(),
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
            from: secondUser.address,
            to: userContract.address,
            success: false,
        });

        const userData = await userContract.getUserData();
        expect(userData.postIndex).toStrictEqual(0n);
    });

    it('should create multiple posts', async () => {
        const result1 = await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'CreatePost',
                queryId: 0n,
                title: 'Test Post 1',
                text: 'Test Post Text 1',
            },
        );
        expect(result1.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });

        const result2 = await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'CreatePost',
                queryId: 0n,
                title: 'Test Post 2',
                text: 'Test Post Text 2',
            },
        );
        expect(result2.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });

        const postData1 = await blockchain
            .openContract(Post.fromAddress(result1.transactions[2].inMessage!.info.dest as Address))
            .getPostData();
        expect(postData1.title).toStrictEqual('Test Post 1');
        expect(postData1.text).toStrictEqual('Test Post Text 1');
        expect(postData1.postIndex).toStrictEqual(0n);

        const postData2 = await blockchain
            .openContract(Post.fromAddress(result2.transactions[2].inMessage!.info.dest as Address))
            .getPostData();
        expect(postData2.title).toStrictEqual('Test Post 2');
        expect(postData2.text).toStrictEqual('Test Post Text 2');
        expect(postData2.postIndex).toStrictEqual(1n);

        const userData = await userContract.getUserData();
        expect(userData.postIndex).toStrictEqual(2n);
    });

    it('should not allow to initialize post not through user contract', async () => {
        let postContract = blockchain.openContract(await Post.fromInit(master.address, user.address, 0n));
        const result = await postContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitPost',
                title: 'Test Post',
                text: 'Test Post Text',
            },
        );
        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: postContract.address,
            deploy: true,
            success: false,
        });
        const postData = await postContract.getPostData();
        expect(postData.initialized).toBeFalsy();

        // now try to initialize post through user contract
        const result2 = await userContract.send(
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
        expect(result2.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });

        postContract = blockchain.openContract(
            Post.fromAddress(result2.transactions[2].inMessage!.info.dest as Address),
        );
        expect(result2.transactions).toHaveTransaction({
            from: userContract.address,
            to: postContract.address,
            deploy: false,
            success: true,
        });

        const postData2 = await postContract.getPostData();
        expect(postData2.initialized).toBeTruthy();
        expect(postData2.masterAddress).toEqualAddress(master.address);
        expect(postData2.authorAddress).toEqualAddress(user.address);
        expect(postData2.title).toStrictEqual('Test Post');
        expect(postData2.text).toStrictEqual('Test Post Text');
        expect(postData2.postIndex).toStrictEqual(0n);
        expect(postData2.commentsIndex).toStrictEqual(0n);
        expect(postData2.likesCount).toStrictEqual(0n);
        expect(postData2.commentsPaid).toStrictEqual(0n);
        expect(postData2.likesPaid).toStrictEqual(0n);
    });

    it('should not initialize post twice', async () => {
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

        const result2 = await postContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitPost',
                title: 'REDEPLOY Test Post',
                text: 'REDEPLOY Test Post Text',
            },
        );

        expect(result2.transactions).toHaveTransaction({
            from: user.address,
            to: postContract.address,
            deploy: false,
            success: false,
        });

        const postData = await postContract.getPostData();
        expect(postData.title).toStrictEqual('Test Post');
        expect(postData.text).toStrictEqual('Test Post Text');
    });
});
