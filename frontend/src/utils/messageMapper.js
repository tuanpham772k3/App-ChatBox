export const mapMessagesForDisplay = (messages, currentUserId) => {
  return messages.map((msg, index) => {
    const reactions = msg.reactions ?? [];

    const prevMsg = messages[index - 1];
    const nextMsg = messages[index + 1];

    const currTime = new Date(msg.createdAt);
    const prevTime = prevMsg ? new Date(prevMsg.createdAt) : null;
    const nextTime = nextMsg ? new Date(nextMsg.createdAt) : null;

    const isMine = msg.senderId?._id === currentUserId;

    const isNewDayWithPrev =
      !prevMsg || currTime.toDateString() !== prevTime.toDateString();

    const isDifferentSenderWithPrev =
      prevMsg && prevMsg.senderId?._id !== msg.senderId?._id;

    const isDifferentSenderWithNext =
      nextMsg && nextMsg.senderId?._id !== msg.senderId?._id;

    // Định dạng time
    const msgTimeDate = new Date(msg.createdAt);
    const msgTime = msgTimeDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const msgEditedAt = new Date(msg.editedAt).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // ==== Reactions =====
    const myReaction = reactions?.find((r) => r.userId._id === currentUserId) ?? null;

    const reactionSummary = Object.values(
      reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = {
            emoji: reaction.emoji,
            users: [],
          };
        }

        acc[reaction.emoji].users.push({ ...reaction.userId, emoji: reaction.emoji });

        return acc;
      }, {})
    );

    const recentReactionEmojis = [
      ...new Set(
        reactions
          .slice()
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .map((reaction) => reaction.emoji)
      ),
    ].slice(0, 3);

    const totalReactions = reactions.length;

    const reactionUsers = reactionSummary.flatMap((reaction) => reaction.users);
    const previewReactionUsers = reactionUsers.slice(0, 5);
    const hasMoreReactionUsers = reactionUsers.length > 5;

    return {
      ...msg,

      reactions: {
        myReaction,
        reactionSummary,
        recentReactionEmojis,
        totalReactions,

        previewReactionUsers,
        hasMoreReactionUsers,
      },

      meta: {
        isMine,

        showDate: isNewDayWithPrev,

        showName: !isMine && (!prevMsg || isDifferentSenderWithPrev || isNewDayWithPrev),

        showAvatar:
          !isMine && (!prevMsg || isDifferentSenderWithPrev || isNewDayWithPrev),

        showTime:
          !nextMsg ||
          isDifferentSenderWithNext ||
          (nextTime && currTime.toDateString() !== nextTime.toDateString()),

        msgTimeDate,
        msgTime,
        msgEditedAt,
      },
    };
  });
};
