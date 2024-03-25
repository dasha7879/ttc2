# 🚀 Stage 3: Social Interaction

## Objective
This stage introduces social interactions to the decentralized social network. Participants are tasked with enabling users to like posts and leave comments on them, thereby enriching the network's social dynamic.

## Enhancements to the User and Post Contracts

### Social Interaction Features
- Users must be able to like posts and comment on them through their user contracts. These actions involve the user contract interacting with post contracts to increment likes and to deploy comment contracts.

### Liking Posts
- Implement a mechanism within the user contract that allows users to like a post. This involves sending a message from the user contract to the post contract to increase the `likesCount` by one.

### Commenting on Posts
- Similarly, to comment on a post, a user sends a message from their user contract. The post contract then deploys a new comment contract, passing along the necessary fields and incrementing `commentIndex`.

### Post Contract
- Ensure the post contract has the capability to verify that the like or comment action is coming from a valid user contract. This may involve validating the `userAddress`.

### Comment Contract Structure
The storage for each comment contract should include:

- `initialized`: A boolean value to confirm the comment contract's initialization.
- `masterAddress`: The address of the master contract, inherited from the post contract.
- `commenterAddress`: The address of the commenting user.
- `postAuthorAddress`: The address of the author of the post being commented on.
- `postIndex`: The index of the post being commented on.
- `commentIndex`: The index of the comment within the post.
- `text`: The text of the comment.

Address of the contract should depend on the `masterAddress`, `commenterAddress`, `postAuthorAddress`, `postIndex`, and `commentIndex`. The other fields should be set through the first incoming message during deployment. In the constructor they should be set to initial zero values (an empty string for strings, 0 for numbers and false for booleans).

### Functionality for Interaction Verification
- Implement a method to calculate and verify the sender's address against the expected user contract address. This ensures that likes and comments are genuinely coming from users within the social network (from user contracts).

### Data Retrieval
- Implement getters in the post and comment contracts (`getPostData` and `getCommentData`, respectively) to facilitate the retrieval of information related to posts and comments.

## Security and Verification
- Validate interactions to ensure likes and comments are processed only when they originate from legitimate user contracts. This involves checking that the action's initiator matches the user profile associated with the user contract.

## Note ‼️

Situations with falsification of likes, comments, and votes do not need to be validated. This will simplify the task and focus on the main idea.
