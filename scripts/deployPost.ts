import { toNano } from '@ton/core';
import { Post } from '../wrappers/Post';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const post = provider.open(await Post.fromInit());

    await post.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(post.address);

    // run methods on `post`
}
