# 🚀 Social Network | Tact Challenge №2 by TON Foundation

## Overview
This challenge is designed to engage participants in creating a decentralized social network prototype utilizing the Tact smart contract language. The project consists of five stages, each aimed at implementing a core feature of the social network, from user profiles to decentralized management.

### 📅 Timeline
- **Challenge Start Date:** [Insert Start Date]
- **Submission Deadline:** [Insert Deadline]


## 📝 Tasks Overview

### Stage №1: Creation of the User Contract
- Develop a contract representing the user profile with initial data including user's and master contract's address.
- **Fields for storage:**
    - `master_address`
    - `user_address`
    - `name`
    - `avatar_url`
    - `short_description`
    - `age`
    - `post_index = 0`
- Implement functionality for the user to update `avatar_url` and `short_description`.
- Include a getter `getUserData` to retrieve user profile details.
- **More details about stage №1 [here](descriptions/stage1.md)**

### Stage №2: Posting
- Enhance the user contract to deploy post contracts, incrementing `post_index` with each new post.
- Post contract storage should include fields like `title`, `text`, and `likes_count`.
- Add a getter `getPostData` in the post contract to return post details.
- - **More details about stage №2 [here](descriptions/stage2.md)**

### Stage №3: Social Interaction
- Allow users to like posts and comment on them through user contracts, which communicate with post contracts accordingly.
- Implement a mechanism to verify actions (likes/comments) are performed by legitimate user contracts.
- Include a getter `getCommentData` in the comment contract to return comment details.
- - **More details about stage №3 [here](descriptions/stage3.md)**

### Stage №4: Rewards for Activity
- Implement functionality in the master contract to distribute tokens based on likes and comments.
- Post contracts should send data to the master contract, which in turn sends tokens to the user based on the activity.
- - **More details about stage №4 [here](descriptions/stage4.md)**

### Stage №5: Decentralized Management
- Implement a voting mechanism in the master contract for decision-making by the community.
- Launch a vote with a 24-hour countdown to decide whether to change rewards for activity (likes, comments)
- - **More details about stage №5 [here](descriptions/stage5.md)**

## 📅 Solution submission guide and terms

1. **Registration Process**: Before you begin, make sure to go through the registration process via the [@smartchallengebot](https://t.me/smartchallengebot?start=true). Your solutions will not be accepted if you are not properly registered.

2. **Create a Private GitHub Repository**: Clone this repository and set it as your own private GitHub repo. **Ensuring the visibility configs are set to "private"** is crucial to safeguarding your solution.

3. **Set Your Token**: Utilize the `token` provided to you during registration in Telegram bot and set it as a secret variable called USER_TOKEN in your private repository. You can learn more about setting secret variables in the [official GitHub documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository).

4. **Submit Your Solution**: When you are ready to submit your solution, simply push your code into your private repository. The code will be sent to the task review server, and GitHub actions will display the status of your submission.

5. **Solution Evaluation**: If at least one of your solutions works well, your submission will be counted. Feel free to push solutions for more tasks; GitHub actions will run your code against tests and count successful submissions. To see a detailed report on your submission, proceed to GitHub Actions tab and you will see a similar report along with possible errors if present:
<div align="center">

| Stage  | Compiled | Tests Passed | Points | Gas Used | Compilation Error |
|--------|:--------:|:------------:|:------:|:----------------------:|:-----------------:|
| 1      | ❌ | ❌ | 0 | N/A | [Error Details](#compilation-error-task-1) |
| 2      | ✅ | ❌ 0/6 | 0 | 0 |  |
| 3      | ✅ | ✅ 10/10 | 5.127 | 491,235,717 |  |
| 4      | ❌ | ❌ | 0 | N/A | [Error Details](#compilation-error-task-4) |
| 5      | ❌ | ❌ | 0 | N/A | [Error Details](#compilation-error-task-5) |

</div>

6. **Check Your Points**: To check your solution points, review the logs of the GitHub action for your latest commit. Additionally, you can find your solution points in the menu button inside of the Telegram bot.

**Best of luck with your submissions!**

## ‼️ Important rules:
- It's forbidden to use any FunC/Fift code inside of submitted Tact solutions. Participants who will have FunC/Fift code in their submissions will be disqualified. This rule applies to Tact bindings as they're using a lower level of abstraction thus compromising the nature of Tact Challenge.
- Please don't share your solution's code with anybody. If someone's submission will be suspected of using your code - both participants will be disqualified. Repeated case will cause lifetime ban from TON Smart Challenges.

## 🏆 Scoring and Prizes

Winners of the contest will receive prizes denominated in Toncoin, the native cryptocurrency of TON blockchain, which is also used as a resource for contract execution.

Each stage can bring you a max of 6 points. You get 5 points for solving a stage. You get an extra point if you solve it without using any gas.

**Minimum amount** of points to be eligible for the prize is **6 points**.

Prizes:
- The top 15% of participants share $7,000 in TON
- The middle 30% of participants share $7,000 in TON
- The bottom 55% of participants share $6,000 in TON

Each prize pool is shared equally among the participants in that group. In total, we're giving away $20,000 in TON prizes.

The total prize might change depending on the number of participants.

## 🚀 Getting Started with TON

New to blockchain or TON development? Start here:

- [Blockchain Basics](https://blog.ton.org/what-is-blockchain)
- [TON Intro](https://docs.ton.org/learn/introduction)
- [Developer Portal](https://ton.org/dev?filterBy=developSmartContract)

### 📘 Essential Tact Resources

Master the Tact language with these must-have materials:

- [Video Tutorials [EN]](https://www.youtube.com/@AlefmanVladimirEN-xb4pq/videos)
- [Video Tutorials [RU]](https://www.youtube.com/playlist?list=PLOIvUFGfwP93tZI_WnaLyJsZlskU4ao92)
- [Tact by Example](https://tact-by-example.org/)
- [Tact Docs](https://tact-lang.org/)
- [Join Tact Community](https://t.me/tactlang)

Find ready-to-use smart contract examples [here](https://github.com/tact-lang/awesome-tact#-smart-contracts-examples). Explore more about Tact in the [awesome-tact repository](https://github.com/tact-lang/awesome-tact).

### 🛠️ Tools for Tact Compilation and Testing

#### For Tact Challenge

For Tact Challenge we recommend cloning current repository and follow the submission guide described above.

#### To quickstart your own Tact projects

We recommend using [blueprint framework](https://docs.ton.org/develop/smart-contracts/sdk/javascript) for a smooth Tact development experience:

- `npm create ton@latest` to build contracts
- [Watch Video Tutorials](https://www.youtube.com/watch?v=SDUlVUYWo1I&t=0s)
- Use official Tact [documentation](https://docs.tact-lang.org/).

#### Online IDE to get started without additional setups

https://ide.nujan.io/

#### Tact syntax highlight

For a more streamlined coding experience, consider using Tact-specific IDE or editor plugins for syntax highlighting and typechecking.

- The official VS Code [extension for Tact](https://marketplace.visualstudio.com/items?itemName=KonVik.tact-lang-vscode)
- JetBrains IDEs [TON plugin](https://plugins.jetbrains.com/plugin/23382-ton) provides Tact support
- Vim/NeoVim [plugin for Tact](https://github.com/tact-lang/tact.vim)



### 🌍 TON Developers Community Chats

Stay in the loop and engage with other developers:

- [TON Dev Chat (EN)](https://t.me/tondev_eng)
- [TON Dev Chat (中文)](https://t.me/tondev_zh)
- [TON Dev Chat (РУ)](https://t.me/tondev)