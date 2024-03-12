import { toNano } from '@ton/core';
import { User } from '../wrappers/User';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const user = provider.open(await User.fromInit());

    await user.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(user.address);

    // run methods on `user`
}
