# 🚀 Stage 2: Posting

## Objective
The aim of this stage is to enhance the previously created user profile contract by integrating the ability to deploy contracts for individual posts. This requires the user contract to manage a sequence of posts, each represented by its unique contract.

## Enhancements to the User Contract

### Posting Functionality
- Implement a new function within the user contract that allows for the deployment of post contracts.
- Each post is to be treated as a separate contract, with the user contract passing the current `post_index` to the newly created post contract and subsequently incrementing it by one.

### Post Contract Structure
The storage for each post contract should include:

- `initialized`: A boolean value to confirm the post contract's initialization.
- `masterAddress`: The address of the master contract, inherited from the user contract.
- `authorAddress`: The address of the user, to link the post back to the user profile.
- `postIndex`: The index of the post, provided by the user contract during deployment.
- `title`: The title of the post.
- `text`: The body text of the post.
- `likesCount = 0`: Initializes the count of likes for the post.
- `comment_index = 0`: Initializes the count of comments for the post.
- `likes_paid = 0`: For tracking likes that have been compensated (to be used in Stage 4).
- `comments_paid = 0`: For tracking comments that have been compensated (to be used in Stage 4).

### Deployment

- The post contract address should depend on the `masterAddress`, `authorAddress`, and `postIndex`.
- The other fields should be set through the first incoming message during deployment. In the constructor they should be set to initial zero values (an empty string for strings, 0 for numbers and false for booleans).

### Post Contract Functionality

#### Data Retrieval
- Implement a getter `postData` in the post contract to return all the above-mentioned fields, facilitating data access.

## Security and Verification
- Ensure that the functionality to deploy post contracts is secured and can only be executed by the owner of the user profile.
- Verify the integrity of the post deployment process, ensuring each post contract correctly references its originating user profile.

## Development Recommendations

### Tools and Resources
- Continue utilizing the official Tact language [documentation](https://docs.tact-lang.org/).

### Testing
- Thoroughly test the new posting functionality, verifying that post contracts are deployed correctly and that the `post_index` is incremented accurately.
- Test the `getPostData` getter for correct retrieval of post information.

