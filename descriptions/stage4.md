# 🚀 Stage 4: Rewards for Activity

## Objective
The fourth stage of the Tact Smart Challenge is aimed at stimulating user activity in a decentralized social network by means of a reward system in the form of tokens. Participants will have to implement functionality in the master contract that allows them to distribute rewards based on the number of messages received (likes and comments).
## Enhancements to the Post and Master Contracts

### Reward Distribution Logic
- Incorporate a mechanism within the post contracts that communicates with the master contract to initiate reward distribution based on the number of likes and comments a post has received.

### Post Contract Updates
- Post contracts must now track the number of likes and comments that have been rewarded to prevent duplicate rewards.
    - `likes_paid`: Tracks the number of likes that have been compensated.
    - `comments_paid`: Tracks the number of comments that have been compensated.

- Implement a function to calculate the eligible rewards for likes and comments that haven't been compensated yet and communicate this information to the master contract.

### Master Contract
- The master contract should have a reward calculation formula and the ability to distribute tokens to users based on the data received from post contracts.
    - This formula should take into account the `likes_count` and `comment_index` from posts, adjusting for already paid interactions.

### Security and Verification
- Ensure that only legitimate requests from post contracts can trigger the reward distribution process in the master contract.
