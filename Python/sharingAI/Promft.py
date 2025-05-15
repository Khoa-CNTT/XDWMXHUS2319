from typing import List, Tuple


class TablePromptGenerator:
    def generate_table_specific_logic(
        self, relevant_tables: List[str]
    ) -> Tuple[str, str]:
        """
        Generate table-specific prompt logic for the given relevant tables, incorporating query and IDs if provided.

        Args:
            relevant_tables: List of table names from _preprocess_query_async.
            query: The normalized user query (optional).
            ids: List of IDs with their types from _preprocess_query_async (optional).

        Returns:
            A string containing the combined table-specific logic for all relevant tables.
        """
        table_specific_logic = []
        database_table_semantics_and_relationships = []
        for table in relevant_tables:
            if table == "Users":
                table_specific_logic.append(
                    "* **`Users Table`**:Likely filter: `FullName LIKE ?` using a parameter derived from `{query}`. Apply `{ids}` filters if provided (e.g., `type: UserId` -> `Users.Id`)."
                )
                database_table_semantics_and_relationships.append(
                    """* **`Users Table`**: The table is joined to all other tables. The record in Users is created when the user registers. The table is joined to RidePosts, Rides, Posts, FriendShips, Comments, Likes, Notifications, Conversations, Messages, Shares, and CommentLikes. The record in Users is created when the user registers.
                    * **Users**: Stores basic user information. Primary Key: `Id`."""
                )
            elif table == "RidePosts":
                table_specific_logic.append(
                    """* **`RidePosts Table`**:
                    * The table is joined to Rides, the record in RidePosts is created when the driver creates a ride offer and joined with the Users table to get the user poster details.                                                                
                    * Default Filters: Consider adding `Status = 0` unless the query asks for historical/canceled posts. Maybe `StartTime >= GETDATE()` for future rides. Add `IsDeleted = 0` if that column exists.
                    * Location Filters: Use `LIKE ?` with wildcards (e.g., `%location%`) for `StartLocation` and `EndLocation`.
                    * Join with `Users` on `RidePosts.UserId` to get the poster's info.
                    * Apply `{ids}` filters if provided (e.g., `type: UserId` -> `RidePosts.UserId` -> `Users.Id`, `type: Id` -> `RidePosts.Id`)."""
                )
                database_table_semantics_and_relationships.append(
                    """* **`RidePosts Table`**: The table is joined to Rides, the record in RidePosts is created when the driver creates a ride offer and joined with the Users table to get the user poster details. The table is joined to Users, the record in RidePosts is created when the driver creates a ride offer and joined with the Users table to get the user poster details.
                    * **RidePosts**: Represents **offers** or requests for shared rides. Primary Key: `Id`. Foreign Key: `UserId` references `Users.Id`. Contains `StartLocation`, `EndLocation`, `StartTime`, `Content`, `Status` (Integer: 0: open, 1: Matched, 2: Canceled). **Use this table when users search for available rides or view ride offers they created.**
                    """
                )
            elif table == "Rides":
                table_specific_logic.append(
                    """* **`Rides Table'`**:
                            * The table is joined to RidePosts, the record in Rides is created when the customer(PassengerId) accepts the ride created by the driver(DriverId) in the RidePosts(UserId) table.
                            * Only perform the query when the question implies user ownership.
                            * Filter: `WHERE Rides.PassengerId = ?` (if they were a passenger) OR `WHERE Rides.DriverId = ?` (if they were the driver/poster). Determine context from `{query}`.
                            * Join with `RidePosts` on `Rides.RidePostId` to get ride details (locations).
                            * Join with `Users` on `Rides.PassengerId` and `Rides.DriverId` (aliasing `Users` table) to get participant details.
                            * Apply `{ids}` filters if provided (e.g., `type: DriverId` -> `Rides.DriverId` -> `Users.Id`, `type: PassengerId` -> `Rides.PassengerId` -> `Users.Id`, `type: RidePostId` -> `Rides.RidePostId` -> `RidePosts.Id,`type: Id` -> `Rides.Id`)
                            * Status codes: 0: Pending, 1: Accepted, 2: Rejected, 3: Completed."""
                )
                database_table_semantics_and_relationships.append(
                    """ * **`Rides Table`**: The table is joined to RidePosts, the record in Rides is created when the customer(PassengerId) accepts the ride created by the driver(DriverId) in the RidePosts(UserId) table. The table is joined to Users, the record in Rides is created when the customer(PassengerId) accepts the ride created by the driver(DriverId) in the RidePosts(UserId) table.
                        * **Rides**: Represents **actual accepted/joined** rides. Primary Key: `Id`. Foreign Keys: `PassengerId` references `Users.Id`, `DriverId` references `Users.Id` (DriverId should be the same as RidePosts.UserId), `RidePostId` references `RidePosts.Id`. Contains `StartTime`, `EndTime`, `Status` (Integer: 0: Pending, 1: Accepted, 2: Rejected, 3: Completed), `Fare`, `CreatedAt` (when passenger accepted), `IsSafetyTrackingEnabled` (boolean: 1 for enabled, 0 for disabled). **Only query this table when the user asks about rides they have specifically joined as a passenger or driven for.**"""
                )
            elif table == "Posts":
                table_specific_logic.append(
                    """* **`Posts Table`**:
                            * Filter: `WHERE Posts.UserId = ?` (if the query is about the user's posts). Pass `{user_id}`.
                            * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted posts.
                            * Filter based on `{query}` (e.g., `Content LIKE ?`).
                            * Filter by `CreatedAt` if the query is time-related (e.g., `CreatedAt >= ?`).
                            * Only apply `PostType` equal to `0` or `1` (0 is type public). 
                            * Join with `Users` on `Posts.UserId` to get the poster's info.
                            * Apply `{ids}` filters if provided (e.g., `type: UserId` -> `Posts.UserId` -> `Users.Id`, `type: Id` -> `Posts.Id`)."""
                )
                database_table_semantics_and_relationships.append(
                    """ * **`Posts Table`**: The table is joined to Likes, Shares, and Comments. The record in Posts is created when the user creates a post. The table is joined to Users, the record in Posts is created when the user creates a post.
                        * **Posts**: Stores user-created posts (like Facebook status updates). Primary Key: `Id`. Foreign Key: `UserId` references `Users.Id`. Contains `Content`, `ImageUrl`, `VideoUrl`, `CreatedAt`.
"""
                )
            elif table == "FriendShips":
                table_specific_logic.append(
                    """* **`FriendShips Table`**:
                            * Filter: `WHERE (Friendships.UserId = ? OR Friendships.FriendId = ?) AND Status = 1`. Pass `{user_id}` twice.
                            * Filter: `WHERE Friendships.UserId = ? AND Status = 0` (if the query is about pending requests). Pass `{user_id}`.
                            * Filter: `WHERE Friendships.FriendId = ? AND Status = 0` (if the query is about received requests). Pass `{user_id}`.
                            * Join `Users` twice: `JOIN Users U1 ON Friendships.UserId = U1.Id JOIN Users U2 ON Friendships.FriendId = U2.Id`. Select details from `U1` and `U2`, making sure to return the *friend's* details (the one whose ID doesn't match `{user_id}`).
                            * Join with `Users` on `Friendships.UserId` and `Friendships.FriendId` to get both users' details.
                            * Apply `{ids}` filters if provided (e.g., `type: UserId` -> `Friendships.UserId` -> `Users.Id`, `type: FriendId` -> `Friendships.FriendId` -> `Users.Id`)"""
                )
                database_table_semantics_and_relationships.append(
                    """ * **`FriendShips Table`**: The table is joined to Users, the record in FriendShips is created when the user sends a friend request. The table is joined to Users, the record in FriendShips is created when the user sends a friend request.
                        * **Friendships**: Manages friend relationships. Primary Key: `Id`. Foreign Keys: `UserId` references `Users.Id`, `FriendId` references `Users.Id`. `Status` (Integer: 0: Pending, 1: Accepted, 2: Rejected, 3: Removed). Represents a two-way relationship when Status is 1.
"""
                )
            elif table == "Comments":
                table_specific_logic.append(
                    """* **`Comments Table`**:
    * Only create the query when the question implies user ownership.
    * The table is joined to CommentLikes, the record in Comments is created when the user comments on a post.
    * The table is joined to Users, the record in Comments is created when the user comments on a post.
    * The table is joined to Posts, the record in Comments is created when the user comments on a post.
    * Just like Posts, the table is joined to Likes and Shares, the record in Comments is created when the user comments on a post.
    * Filter: `WHERE Comments.UserId = ?` (if the query is about the user's comments). Pass `{user_id}`.
    * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted comments.
    * Filter based on `{query}` (e.g., `Content LIKE ?`).
    * Filter by `CreatedAt` if the query is time-related (e.g., `CreatedAt >= ?`).
    * Join with `Users` on `Comments.UserId` to get the commenter's info.
    * Join with `Posts` on `Comments.PostId` to get post details if needed.
    * Apply `{ids}` filters if provided (e.g., `type: CommentId` -> `Comments.Id`, `type: PostId` -> `Comments.PostId` -> `Posts.Id`, `type: UserId` -> `Comments.UserId` -> `Users.Id`)."""
                )
                database_table_semantics_and_relationships.append(
                    """* **`Comments Table`**: The table is joined to Likes, Shares, and Posts. The record in Comments is created when the user comments on a post. The table is joined to Users, the record in Comments is created when the user comments on a post.
                    * **Comments**: Stores comments on posts. Primary Key: `Id`. Foreign Keys: `UserId` references `Users.Id`, `PostId` references `Posts.Id`. Contains `Content`.
"""
                )
            elif table == "Likes":
                table_specific_logic.append(
                    """* **`Likes Table`**:
    * Only create the query when the question implies user ownership.
    * The table is joined to Likes, the record in Likes is created when the user likes a post.
    * The table is joined to Users, the record in Likes is created when the user likes a post.
    * The table is joined to Posts, the record in Likes is created when the user likes a post.
    * The table is joined to Comments, the record in Likes is created when the user likes a post.
    * Filter: `WHERE Likes.UserId = ?` (if the query is about the user's likes). Pass `{user_id}`.
    * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted likes.
    * Join with `Users` on `Likes.UserId` to get the user's info.
    * Join with `Posts` on `Likes.PostId` to get post details if needed.
    * Join with `Comments` on `Likes.CommentId` to get comment details if needed.
    * Apply `{ids}` filters if provided (e.g., `type: LikeId` -> `Likes.Id`, `type: PostId` -> `Likes.PostId` -> `Posts.Id`, `type: UserId` -> `Likes.UserId` -> `Users.Id`)."""
                )
                database_table_semantics_and_relationships.append(
                    """* **`Likes Table`**: The table is joined to Posts, Shares, and Comments. The record in Likes is created when the user likes a post. The table is joined to Users, the record in Likes is created when the user likes a post.
                    * **Likes**: Tracks likes on posts. Primary Key: `Id`. Foreign Keys: `UserId` references `Users.Id`, `PostId` references `Posts.Id`. `IsLike` is boolean (true: 1, false: 0, potentially for unlike).
                    """
                )
            elif table == "Notifications":
                table_specific_logic.append(
                    """* **`Notifications Table`**:
    * Only create the query when the question implies user ownership.
    * The table is joined to Users, the record in Notifications is created when the user receives a notification.
    * Filter: `WHERE Notifications.ReceiverId = ?` (if the query is about the user's notifications). Pass `{user_id}`.
    * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted notifications.
    * Filter based on `{query}` (e.g., `Title LIKE ?` or `Content LIKE ?`).
    * Filter by `CreatedAt` if the query is time-related (e.g., `CreatedAt >= ?`).
    * Filter by `IsRead` if the query is about unread notifications (e.g., `IsRead = 0`).
    * Join with `Users` on `Notifications.SenderId` to get the sender's info.
    * Apply `{ids}` filters if provided (e.g., `type: SenderId` -> `Notifications.SenderId` -> `Users.Id`, `type: ReceiverId` -> `Notifications.ReceiverId` -> `Users.Id`, `type: Id` -> `Notifications.Id`)."""
                )
                database_table_semantics_and_relationships.append(
                    """* **`Notifications Table`**: The table is joined to Users, the record in Notifications is created when the user receives a notification. The table is joined to Users, the record in Notifications is created when the user receives a notification.
                    * **Notifications**: Stores notifications sent to users. Primary Key: `Id`. Foreign Keys: `SenderId` references `Users.Id`, `ReceiverId` references `Users.Id`. Contains `Title`, `Content`, `IsRead` (boolean: 1 for read, 0 for unread), `Url` endpoint, and `Type` (Integer: 0: PostLiked, 1: PostCommented, 2: PostShared, 3: NewMessage, 4: NewFriendRequest, 5: RideInvite, 6: SystemAlert, 7: SendFriend, 8: AcceptFriend, 9: RejectFriend).
                    """
                )
            elif table == "Conversations":
                table_specific_logic.append(
                    """* **`Conversations Table`**:
    * Only create the query when the question implies user ownership.
    * The table is joined to Messages, the record in Conversations is created when the user sends a message.
    * The table is joined to Users, the record in Conversations is created when the user sends a message.
    * Filter: `WHERE Conversations.UserId1 = ? OR Conversations.UserId2 = ?`. Pass `{user_id}` twice.
    * Join with `Users` on `Conversations.UserId1` and `Conversations.UserId2` to get both users' details.
    * Apply `{ids}` filters if provided (e.g., `type: UserId1` -> `Conversations.UserId1` -> `Users.Id`, `type: UserId2` -> `Conversations.UserId2` -> `Users.Id`, `type: ConversationId` -> `Conversations.Id`)."""
                )
                database_table_semantics_and_relationships.append(
                    """* **`Conversations Table`**: The table is joined to Messages, the record in Conversations is created when the user sends a message. The table is joined to Users, the record in Conversations is created when the user sends a message.
                    * **Conversations**: Represents a chat conversation between two users. Primary Key: `Id`. Foreign Keys: `UserId1` references `Users.Id`, `User2Id` references `Users.Id`. **Crucially, only queryable if the current `user_id` matches either `UserId1` or `UserId2`**.
                    """
                )
            elif table == "Messages":
                table_specific_logic.append(
                    """* **`Messages Table`**:
    * Only create the query when the question implies user ownership.
    * The table is joined to Conversations, the record in Messages is created when the user sends a message.
    * The table is joined to Users, the record in Messages is created when the user sends a message.
    * Filter: `WHERE Messages.SenderId = ?` (if the query is about the user's sent messages). Pass `{user_id}`.
    * Filter ReciverId on Conversations table: `WHERE Conversations.UserId1 = ? OR Conversations.UserId2 = ?`. Pass `{user_id}` twice.
    * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted messages.
    * Filter based on `{query}` (e.g., `[Content] LIKE ?`).
    * Filter by `CreatedAt` if the query is time-related (e.g., `CreatedAt >= ?`).
    * Join with `Users` on `Messages.SenderId` to get the sender's info.
    * Join with `Conversations` on `Messages.ConversationId` to get conversation details if needed.
    * Apply `{ids}` filters if provided (e.g., `type: SenderId` -> `Messages.SenderId` -> `UserId.Id`, `type: ConversationId` -> `Messages.ConversationId` -> Conversations.Id, `type: Id` -> `Messages.Id`)."""
                )
                database_table_semantics_and_relationships.append(
                    """* **`Messages Table`**: The table is joined to Conversations, the record in Messages is created when the user sends a message. The table is joined to Users, the record in Messages is created when the user sends a message.
* **Messages**: Stores individual messages within a conversation. Primary Key: `Id`. Foreign Keys: `ConversationId` references `Conversations.Id`, `SenderId` references `Users.Id`. Contains `Content` and `Status` (Integer: 0: Sent, 1: Delivered, 2: Seen). *(Note: You referred to this table as 'Messengers' but 'Messages' is more standard and aligns with the template's original intent)*.
                    """
                )
            elif table == "Shares":
                table_specific_logic.append(
                    """
            * **`Shares Table`**:
                * Only create the query when the question implies user ownership.
                * The table is joined to Posts, the record in Shares is created when the user shares a post.
                * The table is joined to Users, the record in Shares is created when the user shares a post.
                * Filter: `WHERE Shares.UserId = ?` (if the query is about the user's shares). Pass `{user_id}`.
                * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted shares.
                * Filter based on `{query}` (e.g., `Content LIKE ?`).
                * Join with `Users` on `Shares.UserId` to get the user's info.
                * Join with `Posts` on `Shares.PostId` to get post details if needed.
                * Apply `{ids}` filters if provided (e.g., `type: UserId` -> `Shares.UserId` -> `Users.Id`, `type: PostId` -> `Shares.PostId` -> `Posts.Id`, `type: Id` -> `Shares.Id`).
            """
                )
                database_table_semantics_and_relationships.append(
                    """* **`Shares Table`**: The table is joined to Posts, the record in Shares is created when the user shares a post. The table is joined to Users, the record in Shares is created when the user shares a post.
* **Shares**: Tracks when users share posts. Primary Key: `Id`. Foreign Keys: `UserId` references `Users.Id`, `PostId` references `Posts.Id`.
                    """
                )
            elif table == "CommentLikes":
                table_specific_logic.append(
                    """* **`CommentLikes Table`**:
                    * Only create the query when the question implies user ownership.
                    * The table is joined to Comments, the record in CommentLikes is created when the user likes a comment.
                    * The table is joined to Users, the record in CommentLikes is created when the user likes a comment.
                    * Filter: `WHERE CommentLikes.UserId = ?` (if the query is about the user's comment likes). Pass `{user_id}`.
                    * Default Filters: Consider adding `IsDeleted = 0` unless the query asks for deleted comment likes.
                    * Filter based on `{query}` (e.g., `Content LIKE ?`).
                    * Join with `Users` on `CommentLikes.UserId` to get the user's info.
                    * Join with `Comments` on `CommentLikes.CommentId` to get comment details if needed.
                    * Apply `{ids}` filters if provided (e.g., `type: UserId` -> `CommentLikes.UserId` -> `Users.Id`, `type: CommentId` -> `CommentLikes.CommentId` -> `Comments.Id`, `type: Id` -> `CommentLikes.Id`).
                    
                    """
                )
                database_table_semantics_and_relationships.append(
                    """* **`CommentLikes Table`**: The table is joined to Comments, the record in CommentLikes is created when the user likes a comment. The table is joined to Users, the record in CommentLikes is created when the user likes a comment.
    * **CommentLikes**: Tracks likes on comments. Primary Key: `Id`. Foreign Keys: `UserId` references `Users.Id`, `CommentId` references `Comments.Id`.
                    """
                )
            elif table == "Ratings":
                table_specific_logic.append(
                    """* **`Ratings Table`**:
                    * Only create the query when the question implies a user submitted a rating or wants to view ratings.
                    * The table tracks user-submitted ratings after a ride, typically from passengers to drivers.
                    * Ratings are linked to the ride (`RideId`), the person being rated (`UserId`), and the rater (`RatedByUserId`).
                    * Filter: 
                    * If the user wants to see **their own given ratings**, use `WHERE RatedByUserId = ?`. Pass `{user_id}`.
                    * If the user wants to see **ratings they received**, use `WHERE UserId = ?`. Pass `{user_id}`.
                    * Default Filters: Consider `CreatedAt IS NOT NULL` or ordering by `CreatedAt DESC`.
                    * Filter based on `{query}` (e.g., `Comment LIKE ?` or rating level).
                    * Join with `Users` on both `UserId` and `RatedByUserId` if user information (driver or reviewer) is needed.
                    * Join with `Rides` on `RideId` to retrieve trip information if needed.
                    * Apply `{ids}` filters if provided:
                    * `type: UserId` -> `Ratings.UserId` or `Ratings.RatedByUserId`
                    * `type: RideId` -> `Ratings.RideId`
                    * `type: Id` -> `Ratings.Id`
                    """
                )
                database_table_semantics_and_relationships.append(
                    """* **`Ratings Table`**: This table tracks ratings after a ride. Each rating is submitted by a user (RatedByUserId) and targets another user (UserId), typically a driver. Ratings also reference the ride (`RideId`) and include a numeric level and optional comment.
            * **Ratings**: Records post-ride feedback. 
            * Primary Key: `Id`. 
            * Foreign Keys: `UserId` references `Users.Id` (the person being rated), `RatedByUserId` references `Users.Id` (the rater), `RideId` references `Rides.Id`.
                    """
                )

            logic_str = "\n".join(table_specific_logic)
            semantics_str = "\n".join(database_table_semantics_and_relationships)
        return (logic_str, semantics_str)
