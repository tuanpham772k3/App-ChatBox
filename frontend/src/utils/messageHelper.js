export const buildMessageMeta = (messages, currentUserId) => {
  const getRefId = (ref) => ref?._id || ref;
  const isSameRef = (a, b) => String(getRefId(a)) === String(getRefId(b));

  return messages.map((msg, index) => {
    const prevMsg = messages[index - 1];
    const nextMsg = messages[index + 1];

    const currTime = new Date(msg.createdAt);
    const prevTime = prevMsg ? new Date(prevMsg.createdAt) : null;
    const nextTime = nextMsg ? new Date(nextMsg.createdAt) : null;

    const isMine = isSameRef(msg.senderId, currentUserId);

    const isNewDayWithPrev =
      !prevMsg || currTime.toDateString() !== prevTime.toDateString();

    const isDifferentSenderWithPrev =
      prevMsg && !isSameRef(prevMsg.senderId, msg.senderId);

    const isDifferentSenderWithNext =
      nextMsg && !isSameRef(nextMsg.senderId, msg.senderId);

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
