import { Blockchain, BlockchainSnapshot, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, toNano } from '@ton/core';
import { User } from '../wrappers/User';
import '@ton/test-utils';

describe('Task 1', () => {
    let blockchain: Blockchain;
    let userContract: SandboxContract<User>;
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

    it('should deploy', async () => {
        const userData = await userContract.getUserData();
        expect(userData.initialized).toBeTruthy();
        expect(userData.masterAddress).toEqualAddress(master.address);
        expect(userData.userAddress).toEqualAddress(user.address);
        expect(userData.name).toStrictEqual('Test User');
        expect(userData.shortDescription).toStrictEqual('Test User Short Description');
        expect(userData.avatarUrl).toStrictEqual('https://test.com/avatar.png');
        expect(userData.age).toStrictEqual(25n);
        expect(userData.postIndex).toStrictEqual(0n);
    });

    it('should not deploy by someone else', async () => {
        let secondUserContract = blockchain.openContract(await User.fromInit(master.address, secondUser.address));

        const deployResult = await secondUserContract.send(
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
            to: secondUserContract.address,
            deploy: true,
            success: false,
        });

        const userData = await secondUserContract.getUserData();
        expect(userData.initialized).toBeFalsy();
        expect(userData.masterAddress).toEqualAddress(master.address);
        expect(userData.userAddress).toEqualAddress(secondUser.address);
        expect(userData.name).toStrictEqual('');
        expect(userData.shortDescription).toStrictEqual('');
        expect(userData.avatarUrl).toStrictEqual('');
        expect(userData.age).toStrictEqual(0n);
        expect(userData.postIndex).toStrictEqual(0n);
    });

    it('should not deploy twice', async () => {
        const deployResult = await userContract.send(
            user.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'InitUser',
                name: 'REDEPLOY',
                shortDescription: 'REDEPLOY Test User Short Description',
                avatarUrl: 'https://test.com/REDEPLOY.png',
                age: 30n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            deploy: false,
            success: false,
        });

        const userData = await userContract.getUserData();
        expect(userData.initialized).toBeTruthy();
        expect(userData.masterAddress).toEqualAddress(master.address);
        expect(userData.userAddress).toEqualAddress(user.address);
        expect(userData.name).toStrictEqual('Test User');
        expect(userData.shortDescription).toStrictEqual('Test User Short Description');
        expect(userData.avatarUrl).toStrictEqual('https://test.com/avatar.png');
        expect(userData.age).toStrictEqual(25n);
        expect(userData.postIndex).toStrictEqual(0n);
    });

    it('should change avatar', async () => {
        const result = await userContract.send(
            user.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'ChangeAvatarUrl',
                queryId: 0n,
                avatarUrl: 'https://test.com/avatar2.png',
            },
        );
        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });

        const userData = await userContract.getUserData();
        expect(userData.avatarUrl).toStrictEqual('https://test.com/avatar2.png');
    });

    it('should change age', async () => {
        const result = await userContract.send(
            user.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'ChangeShortDescription',
                queryId: 0n,
                shortDescription: 'Test User Short Description 2',
            },
        );
        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: userContract.address,
            success: true,
        });

        const userData = await userContract.getUserData();
        expect(userData.shortDescription).toStrictEqual('Test User Short Description 2');
    });

    it('should not change avatar and age by someone else', async () => {
        const result = await userContract.send(
            secondUser.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'ChangeAvatarUrl',
                queryId: 0n,
                avatarUrl: 'https://test.com/avatar3.png',
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: secondUser.address,
            to: userContract.address,
            success: false,
        });

        const userData = await userContract.getUserData();
        expect(userData.avatarUrl).toStrictEqual('https://test.com/avatar.png');

        const result2 = await userContract.send(
            secondUser.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'ChangeShortDescription',
                queryId: 0n,
                shortDescription: 'Test User Short Description 3',
            },
        );

        expect(result2.transactions).toHaveTransaction({
            from: secondUser.address,
            to: userContract.address,
            success: false,
        });

        const userData2 = await userContract.getUserData();
        expect(userData2.shortDescription).toStrictEqual('Test User Short Description');
    });
});
