import { toNano } from '@ton/core';
import { Comment } from '../wrappers/Comment';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const comment = provider.open(await Comment.fromInit());

    await comment.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(comment.address);

    // run methods on `comment`
}
