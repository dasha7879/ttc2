import { toNano } from '@ton/core';
import { Big } from '../wrappers/Big';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const big = provider.open(await Big.fromInit());

    await big.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(big.address);

    // run methods on `big`
}
