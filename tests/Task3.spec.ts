import { Blockchain, BlockchainSnapshot, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, toNano } from '@ton/core';
import { User } from '../wrappers/User';
import { Post } from '../wrappers/Post';
import { Comment } from '../wrappers/Comment';
import '@ton/test-utils';

describe('Task 3', () => {
    let blockchain: Blockchain;

    let userContract: SandboxContract<User>;
    let postContract: SandboxContract<Post>;
    let commentContract: SandboxContract<Comment>;
    let secondUserContract: SandboxContract<User>;

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
        secondUserContract = blockchain.openContract(await User.fromInit(master.address, secondUser.address));

        {
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
        }

        {
            const deployResult = await secondUserContract.send(
                secondUser.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'InitUser',
                    name: 'Second User',
                    shortDescription: 'Second User Short Description',
                    avatarUrl: 'https://test.com/avatar2.png',
                    age: 20n,
                },
            );

            expect(deployResult.transactions).toHaveTransaction({
                from: secondUser.address,
                to: secondUserContract.address,
                deploy: true,
                success: true,
            });
        }

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

        snapshot = await blockchain.snapshot();
    });

    afterEach(async () => {
        blockchain.loadFrom(snapshot);
    });

    it('should like post', async () => {
        const result = await secondUserContract.send(
            secondUser.getSender(),
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
            from: secondUser.address,
            to: secondUserContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: secondUserContract.address,
            to: postContract.address,
            success: true,
        });

        const postData = await postContract.getPostData();
        expect(postData.likesCount).toStrictEqual(1n);
    });

    it('should comment post', async () => {
        const result = await secondUserContract.send(
            secondUser.getSender(),
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
            from: secondUser.address,
            to: secondUserContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: secondUserContract.address,
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
        expect(postData.commentsIndex).toStrictEqual(1n);

        const commentData = await commentContract.getCommentData();
        expect(commentData.initialized).toBeTruthy();
        expect(commentData.masterAddress).toEqualAddress(master.address);
        expect(commentData.commenterAddress).toEqualAddress(secondUser.address);
        expect(commentData.postIndex).toStrictEqual(0n);
        expect(commentData.commentIndex).toStrictEqual(0n);
        expect(commentData.text).toStrictEqual('Test Comment');
    });

    it('should only allow user to send likes and comments', async () => {
        const result = await secondUserContract.send(
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
            to: secondUserContract.address,
            success: false,
        });

        const postData = await postContract.getPostData();
        expect(postData.likesCount).toStrictEqual(0n);

        const result2 = await secondUserContract.send(
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

        expect(result2.transactions).toHaveTransaction({
            from: user.address,
            to: secondUserContract.address,
            success: false,
        });
        expect(result2.transactions).not.toHaveTransaction({
            deploy: true,
        });

        const postData2 = await postContract.getPostData();
        expect(postData2.commentsIndex).toStrictEqual(0n);
    });

    it('should only allow user to send likes and comments to existing posts', async () => {
        let secondPostContract: SandboxContract<Post>;
        secondPostContract = blockchain.openContract(await Post.fromInit(master.address, user.address, 1n));

        {
            const result = await secondUserContract.send(
                secondUser.getSender(),
                {
                    value: toNano('0.1'),
                },
                {
                    $$type: 'LikePost',
                    queryId: 0n,
                    authorAddress: user.address,
                    postId: 1n,
                },
            );

            expect(result.transactions).toHaveTransaction({
                from: secondUser.address,
                to: secondUserContract.address,
                success: true,
            });
            expect(result.transactions).toHaveTransaction({
                from: secondUserContract.address,
                to: secondPostContract.address,
                success: false,
                deploy: false,
            });
        }

        {
            const result = await secondUserContract.send(
                secondUser.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'CommentPost',
                    queryId: 0n,
                    authorAddress: user.address,
                    postId: 1n,
                    text: 'Test Comment',
                },
            );

            expect(result.transactions).toHaveTransaction({
                from: secondUser.address,
                to: secondUserContract.address,
                success: true,
            });
            expect(result.transactions).toHaveTransaction({
                from: secondUserContract.address,
                to: secondPostContract.address,
                success: false,
                deploy: false,
            });
        }
    });

    it('should not like or comment not through the user contract', async () => {
        {
            const result = await postContract.send(
                user.getSender(),
                {
                    value: toNano('0.1'),
                },
                {
                    $$type: 'PostLiked',
                    queryId: 0n,
                    userAddress: secondUser.address,
                },
            );

            expect(result.transactions).toHaveTransaction({
                from: user.address,
                to: postContract.address,
                success: false,
            });

            const postData = await postContract.getPostData();
            expect(postData.likesCount).toStrictEqual(0n);
        }

        {
            const result = await postContract.send(
                user.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'PostCommented',
                    queryId: 0n,
                    userAddress: secondUser.address,
                    text: 'Test Comment',
                },
            );

            expect(result.transactions).toHaveTransaction({
                from: user.address,
                to: postContract.address,
                success: false,
            });

            const postData = await postContract.getPostData();
            expect(postData.commentsIndex).toStrictEqual(0n);
        }
    });

    it('should not initizalie comment contract directly', async () => {
        {
            const commentContract = blockchain.openContract(
                await Comment.fromInit(master.address, user.address, secondUser.address, 0n, 0n),
            );

            const result = await commentContract.send(
                secondUser.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'InitComment',
                    text: 'Test Comment',
                },
            );

            expect(result.transactions).toHaveTransaction({
                from: secondUser.address,
                to: commentContract.address,
                deploy: true,
                success: false,
            });

            const commentData = await commentContract.getCommentData();
            expect(commentData.initialized).toBeFalsy();

            const postData = await postContract.getPostData();
            expect(postData.commentsIndex).toStrictEqual(0n);
        }

        {
            const result = await secondUserContract.send(
                secondUser.getSender(),
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
                from: secondUser.address,
                to: secondUserContract.address,
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
            expect(postData.commentsIndex).toStrictEqual(1n);

            const commentData = await commentContract.getCommentData();
            expect(commentData.initialized).toBeTruthy();
            expect(commentData.masterAddress).toEqualAddress(master.address);
            expect(commentData.commenterAddress).toEqualAddress(secondUser.address);
            expect(commentData.postIndex).toStrictEqual(0n);
            expect(commentData.commentIndex).toStrictEqual(0n);
            expect(commentData.text).toStrictEqual('Test Comment');
        }
    });

    it('should not initialize comment contract twice', async () => {
        const result = await secondUserContract.send(
            secondUser.getSender(),
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
            from: secondUser.address,
            to: secondUserContract.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: secondUserContract.address,
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
        expect(postData.commentsIndex).toStrictEqual(1n);

        const commentData = await commentContract.getCommentData();
        expect(commentData.initialized).toBeTruthy();
        expect(commentData.masterAddress).toEqualAddress(master.address);
        expect(commentData.commenterAddress).toEqualAddress(secondUser.address);
        expect(commentData.postIndex).toStrictEqual(0n);
        expect(commentData.commentIndex).toStrictEqual(0n);
        expect(commentData.text).toStrictEqual('Test Comment');

        const result2 = await commentContract.send(
            secondUser.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'InitComment',
                text: 'REDEPLOY Test Comment',
            },
        );

        expect(result2.transactions).toHaveTransaction({
            from: secondUser.address,
            to: commentContract.address,
            deploy: false,
            success: false,
        });

        const commentData2 = await commentContract.getCommentData();
        expect(commentData2.initialized).toBeTruthy();
        expect(commentData2.masterAddress).toEqualAddress(master.address);
        expect(commentData2.commenterAddress).toEqualAddress(secondUser.address);
        expect(commentData2.postIndex).toStrictEqual(0n);
        expect(commentData2.commentIndex).toStrictEqual(0n);
        expect(commentData2.text).toStrictEqual('Test Comment');
    });
});
