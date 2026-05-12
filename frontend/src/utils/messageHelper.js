export const buildMessageMeta = (messages, currentUserId) => {
  return messages.map((msg, index) => {
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

    return {
      ...msg,

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
      },
    };
  });
};
