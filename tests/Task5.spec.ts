import { Blockchain, BlockchainSnapshot, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { User } from '../wrappers/User';
import { Post } from '../wrappers/Post';
import { Comment } from '../wrappers/Comment';
import { Master } from '../wrappers/Master';
import '@ton/test-utils';

describe('Task 5', () => {
    let blockchain: Blockchain;

    let masterContract: SandboxContract<Master>;
    let userContract: SandboxContract<User>;
    let postContract: SandboxContract<Post>;
    let commentContract: SandboxContract<Comment>;

    let admin: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;
    let secondUser: SandboxContract<TreasuryContract>;
    let snapshot: BlockchainSnapshot;

    const postCode = beginCell().storeUint(1, 32).endCell();
    const commentCode = beginCell().storeUint(2, 32).endCell();

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        user = await blockchain.treasury('user');
        secondUser = await blockchain.treasury('secondUser');
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
        expect(userData.postIndex).toStrictEqual(0n);
    });

    it('should start voting', async () => {
        blockchain.now = Math.floor(Date.now() / 1000);
        const result = await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: admin.address,
            to: masterContract.address,
            success: true,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.lastVoting).toStrictEqual(0n);
        expect(masterData.votingData.votingActive).toBeTruthy();
        expect(masterData.votingData.newPriceForLike).toStrictEqual(toNano(0.1));
        expect(masterData.votingData.newPriceForComment).toStrictEqual(toNano(0.2));
        expect(masterData.votingData.yesCount).toStrictEqual(0n);
        expect(masterData.votingData.noCount).toStrictEqual(0n);
        expect(masterData.votingData.votingStarted).toStrictEqual(BigInt(blockchain.now));
    });

    it('should vote', async () => {
        blockchain.now = Math.floor(Date.now() / 1000);
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        const result = await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: true,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: userContract.address,
            to: masterContract.address,
            success: true,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.yesCount).toStrictEqual(1n);
        expect(masterData.votingData.noCount).toStrictEqual(0n);
    });

    it('should end voting', async () => {
        blockchain.now = Math.floor(Date.now() / 1000);
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: true,
            },
        );

        blockchain.now! += 60 * 60 * 24 + 1;
        const result = await masterContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'EndVoting',
                queryId: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: masterContract.address,
            success: true,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.lastVoting).toStrictEqual(BigInt(blockchain.now!));
        expect(masterData.votingData.votingActive).toBeFalsy();
        expect(masterData.votingData.newPriceForLike).toStrictEqual(0n);
        expect(masterData.votingData.newPriceForComment).toStrictEqual(0n);
        expect(masterData.votingData.yesCount).toStrictEqual(0n);
        expect(masterData.votingData.noCount).toStrictEqual(0n);
        expect(masterData.votingData.votingStarted).toStrictEqual(0n);

        expect(masterData.priceForLike).toStrictEqual(toNano(0.1));
        expect(masterData.priceForComment).toStrictEqual(toNano(0.2));
    });

    it('should vote multiple times', async () => {
        blockchain.now = Math.floor(Date.now() / 1000);
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: true,
            },
        );

        await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: false,
            },
        );

        await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: false,
            },
        );

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.yesCount).toStrictEqual(1n);
        expect(masterData.votingData.noCount).toStrictEqual(2n);
    });

    it('should not vote after voting ended', async () => {
        blockchain.now = Math.floor(Date.now() / 1000);
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: true,
            },
        );

        blockchain.now! += 60 * 60 * 24 + 1;

        {
            const result = await userContract.send(
                user.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'InitVote',
                    queryId: 0n,
                    vote: true,
                },
            );

            expect(result.transactions).toHaveTransaction({
                from: userContract.address,
                to: masterContract.address,
                success: false,
            });
        }

        {
            await masterContract.send(
                user.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'EndVoting',
                    queryId: 0n,
                },
            );

            const result = await userContract.send(
                user.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'InitVote',
                    queryId: 0n,
                    vote: true,
                },
            );

            expect(result.transactions).toHaveTransaction({
                from: userContract.address,
                to: masterContract.address,
                success: false,
            });
        }

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.votingActive).toBeFalsy();
        expect(masterData.votingData.yesCount).toStrictEqual(0n);
        expect(masterData.votingData.noCount).toStrictEqual(0n);
    });

    it('should change price after "yes" voting', async () => {
        blockchain.now = Math.floor(Date.now() / 1000);
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: true,
            },
        );

        blockchain.now! += 60 * 60 * 24 + 1;
        await masterContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'EndVoting',
                queryId: 0n,
            },
        );

        const masterData = await masterContract.getMasterData();
        expect(masterData.priceForLike).toStrictEqual(toNano(0.1));
        expect(masterData.priceForComment).toStrictEqual(toNano(0.2));

        {
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
            postContract = blockchain.openContract(
                Post.fromAddress(result.transactions[2].inMessage!.info.dest as Address),
            );
            await userContract.send(
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
            await userContract.send(
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
        }

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
            from: masterContract.address,
            to: user.address,
            value: toNano('0.3'),
        });
    });

    it('should not change price after "no" voting', async () => {
        blockchain.now = Math.floor(Date.now() / 1000);
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: false,
            },
        );

        blockchain.now! += 60 * 60 * 24 + 1;
        await masterContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'EndVoting',
                queryId: 0n,
            },
        );

        const masterData = await masterContract.getMasterData();
        expect(masterData.priceForLike).toStrictEqual(toNano(0.05));
        expect(masterData.priceForComment).toStrictEqual(toNano(0.15));

        {
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
            postContract = blockchain.openContract(
                Post.fromAddress(result.transactions[2].inMessage!.info.dest as Address),
            );
            await userContract.send(
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
            await userContract.send(
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
        }

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
            from: masterContract.address,
            to: user.address,
            value: toNano('0.2'),
        });
    });

    it('should only allow user to vote', async () => {
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        const result = await userContract.send(
            secondUser.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: true,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: secondUser.address,
            to: userContract.address,
            success: false,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.yesCount).toStrictEqual(0n);
        expect(masterData.votingData.noCount).toStrictEqual(0n);
    });

    it('should only allow admin to start voting', async () => {
        const result = await masterContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: masterContract.address,
            success: false,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.votingActive).toBeFalsy();
    });

    it('should not start voting if voting is already active', async () => {
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        const result = await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: admin.address,
            to: masterContract.address,
            success: false,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.votingActive).toBeTruthy();
    });

    it('should not start voting if the last one ended less than 24 hours ago', async () => {
        blockchain.now = Math.floor(Date.now() / 1000);
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        blockchain.now! += 60 * 60 * 24 - 1;
        const result = await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: admin.address,
            to: masterContract.address,
            success: false,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.votingActive).toBeTruthy();
    });

    it('should not vote if voting is not active', async () => {
        const result = await userContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitVote',
                queryId: 0n,
                vote: true,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: userContract.address,
            to: masterContract.address,
            success: false,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.yesCount).toStrictEqual(0n);
        expect(masterData.votingData.noCount).toStrictEqual(0n);
    });

    it('should not allow voting directly', async () => {
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        const result = await masterContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Vote',
                queryId: 0n,
                userAddress: user.address,
                vote: true,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: masterContract.address,
            success: false,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.yesCount).toStrictEqual(0n);
        expect(masterData.votingData.noCount).toStrictEqual(0n);
    });

    it('should only allow admin to end voting', async () => {
        await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'StartVoting',
                queryId: 0n,
                newPriceForLike: toNano(0.1),
                newPriceForComment: toNano(0.2),
            },
        );

        const result = await masterContract.send(
            user.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'EndVoting',
                queryId: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: masterContract.address,
            success: false,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.votingActive).toBeTruthy();
    });

    it('should not end voting if voting is not active', async () => {
        const result = await masterContract.send(
            admin.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'EndVoting',
                queryId: 0n,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: admin.address,
            to: masterContract.address,
            success: false,
        });

        const masterData = await masterContract.getMasterData();
        expect(masterData.votingData.votingActive).toBeFalsy();
    });
});
