# 🚀 Stage 3: Social Interaction

## Objective
This stage introduces social interactions to the decentralized social network. Participants are tasked with enabling users to like posts and leave comments on them, thereby enriching the network's social dynamic.

## Enhancements to the User and Post Contracts

### Social Interaction Features
- Users must be able to like posts and comment on them through their user contracts. These actions involve the user contract interacting with post contracts to increment likes and to deploy comment contracts.

### Liking Posts
- Implement a mechanism within the user contract that allows users to like a post. This involves sending a message from the user contract to the post contract to increase the `likes_count` by one.

### Commenting on Posts
- Similarly, to comment on a post, a user sends a message from their user contract. The post contract then deploys a new comment contract, passing along the `comment_index` and incrementing it thereafter.

### Post Contract
- Ensure the post contract has the capability to verify that the like or comment action is coming from a valid user contract. This may involve validating the `user_address` and potentially using the `user_contract_code`.

### Comment Contract Structure
The storage for each comment contract should include:

- `user_address`: The address of the commenting user.
- `post_index`: The index of the post being commented on.
- `comment_index`: The index of the comment within the post.
- `text`: The text of the comment.

### Functionality for Interaction Verification
- Implement a method to calculate and verify the sender's address against the expected user contract address. This ensures that likes and comments are genuinely coming from users within the network.

### Data Retrieval
- Implement getters in the post and comment contracts (`getPostData` and `getCommentData`, respectively) to facilitate the retrieval of information related to posts and comments.

## Security and Verification
- Validate interactions to ensure likes and comments are processed only when they originate from legitimate user contracts. This involves checking that the action's initiator matches the user profile associated with the user contract.

## Note ‼️

Situations with falsification of likes, comments, and votes do not need to be validated. This will simplify the task and focus on the main idea.
