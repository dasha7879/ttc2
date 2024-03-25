# 🚀 Stage 4: Rewards for Activity

## Objective
The fourth stage of the Tact Smart Challenge is aimed at stimulating user activity in a decentralized social network by means of a reward system in the form of tokens. Participants will have to implement functionality in the master contract that allows them to distribute rewards based on the number of messages received (likes and comments).
## Enhancements to the Post and Master Contracts

### Reward Distribution Logic
- Incorporate a mechanism within the post contracts that communicates with the master contract to initiate reward distribution based on the number of likes and comments a post has received.

### Post Contract Updates
- Post contracts must now track the number of likes and comments that have been rewarded to prevent duplicate rewards.
    - `likesPaid`: Tracks the number of likes that have been compensated.
    - `commentsPaid`: Tracks the number of comments that have been compensated.

- Implement a function to calculate the eligible rewards for likes and comments that haven't been compensated yet and communicate this information to the master contract.
- If there are no new likes or comments to reward, the post contract should throw an error.

### Security and Verification
- Ensure that only legitimate requests from post contracts can trigger the reward distribution process in the master contract.

## Master Contract

In this stage, you need to implement Master contract.

VotingData:

- `lastVoting`: The timestamp of the last voting.
- `votingActive`: A boolean value indicating whether a voting process is currently active.
- `newPriceForLike`: The new reward price for likes.
- `newPriceForComment`: The new reward price for comments.
- `yesCount`: The number of votes in favor of the new reward prices.
- `noCount`: The number of votes against the new reward prices.
- `votingStarted`: The timestamp when the voting process started.

Storage:

- `adminAddress`: The address of the admin who can start the voting process.
- `priceForLike`: The current reward price for likes.
- `priceForComment`: The current reward price for comments.
- `votingData`: The structure that stores the voting data.

The fields that are not passed in the constructor should be set to initial zero values (an empty string for strings, 0 for numbers, and false for booleans).

### Functionality

- The master contract should have a reward calculation formula and the ability to distribute TON to users based on the data received from post contracts.
  - This formula should take into account the `likesCount` and `commentIndex` from posts, adjusting for already paid interactions.
