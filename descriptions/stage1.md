# 🚀 Stage 1: Creation of the User Contract

## Objective
The goal for participants is to develop a contract that signifies a user's profile within a decentralized social network. This contract must store initial data of the user, including the user's address and the master contract's address.

## Contract Requirements

### Contract Storage Structure
The following fields must be initialized in the contract's storage upon deployment:

- `master_address`: The address of the master contract.
- `user_address`: The user's address.
- `name`: The user's name.
- `avatar_url`: The URL of the user's avatar.
- `short_description`: A brief profile description.
- `age`: The user's age.
- `post_index = 0`: The index of the user's last post, to be initialized as zero.

### Contract Functionality

#### Deployment
- At the time of contract deployment, `name`, `avatar_url`, `short_description`, and `age` should be set through the first incoming message.
- The `post_index` is to be set to zero, serving the purpose of tracking the index of the latest post by the user.

#### Profile Updates
- Users should have the capability to update their `avatar_url` and `short_description` via specific functions in the contract.
- It should be ensured that only the user whose address is specified in `user_address` can make updates to these fields.

#### Fetching User Data
- Implement a getter function `getUserData` that provides access to the user's data: `user_address`, `name`, `avatar_url`, `short_description`, `age`, `post_index`.

### Security and Verification
- Confirm that only the owner of the profile, whose address is recorded in `user_address`, can alter the `avatar_url` and `short_description`.
- Verify the source of calls to profile update functions, ensuring they originate from the user's specified address.

## Development Recommendations

### Tools and Resources
- Leverage official Tact language [documentation](https://docs.tact-lang.org/).
- Usefull video tutorial for this task
  - In English [**link**](https://www.youtube.com/watch?v=MYSQMq-NaVM&t=0s)
  - In Russian [**link**](https://youtu.be/bQqp8BFhEX4?si=cRBuUbrQKzj0faoZ)
