# 🚀 Stage 1: Creation of the User Contract

## Objective
The goal for participants is to develop a contract that signifies a user's profile within a decentralized social network. This contract must store initial data of the user, including the user's address and the master contract's address.

## Contract Requirements

### Contract Storage Structure
The following fields must be initialized in the contract's storage upon deployment:

- `initialized`: A boolean value to confirm the user contract's initialization.
- `masterAddress`: The address of the master contract.
- `userAddress`: The user's address.
- `name`: The user's name.
- `avatarUrl`: The URL of the user's avatar.
- `shortDescription`: A brief profile description.
- `age`: The user's age.
- `postIndex = 0`: The index of the user's last post, to be initialized as zero.

### Contract Functionality

#### Deployment
- At the time of contract deployment, `initialized`, `name`, `avatarUrl`, `shortDescription`, and `age` should be set through the first incoming message. In the constructor they should be set to initial zero values (an empty string for strings, 0 for numbers and false for booleans).
- Only the `masterAddress` and `userAddress` should be set through the constructor, so the calculation of user contract address will depend on these two fields.
- The `postIndex` is to be set to zero, serving the purpose of tracking the index of the latest post by the user.
- The `initUser` message will be used to deploy the user contract.

#### Profile Updates
- Users should have the capability to update their `avatarUrl` and `shortDescription` via specific functions in the contract.
- It should be ensured that only the user whose address is specified in `userAddress` can make updates to these fields.

#### Fetching User Data
- Implement a getter function `userData` that provides access to the user's data: `initializaed`, `masterAddress`, `userAddress`, `name`, `avataUrl`, `shortDescription`, `age`, `postIndex`.

### Security and Verification
- Confirm that only the owner of the profile, whose address is recorded in `userAddress`, can alter the `avatarUrl` and `shortDescription`.
- Verify the source of calls to profile update functions, ensuring they originate from the user's specified address.

## Development Recommendations

### Tools and Resources
- Leverage official Tact language [documentation](https://docs.tact-lang.org/).
- Usefull video tutorial for this task
  - In English [**link**](https://www.youtube.com/watch?v=MYSQMq-NaVM&t=0s)
  - In Russian [**link**](https://youtu.be/bQqp8BFhEX4?si=cRBuUbrQKzj0faoZ)
-  Online [IDE](https://ide.nujan.io/) to get started without additional setups


