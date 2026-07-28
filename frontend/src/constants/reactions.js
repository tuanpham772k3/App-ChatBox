import likeIcon from "@/assets/emoji/like_emoji.png";
import loveIcon from "@/assets/emoji/love_emoji.png";
import joyIcon from "@/assets/emoji/joy_emoji.png";
import surpriseIcon from "@/assets/emoji/surprise_emoji.png";
import sadIcon from "@/assets/emoji/sad_emoji.png";
import angryIcon from "@/assets/emoji/angry_emoji.png";

export const REACTIONS = {
  like: {
    key: "like",
    src: likeIcon,
    label: "Thích",
  },
  love: {
    key: "love",
    src: loveIcon,
    label: "Yêu thích",
  },
  joy: {
    key: "joy",
    src: joyIcon,
    label: "Cười",
  },
  surprise: {
    key: "surprise",
    src: surpriseIcon,
    label: "Ngạc nhiên",
  },
  sad: {
    key: "sad",
    src: sadIcon,
    label: "Buồn",
  },
  angry: {
    key: "angry",
    src: angryIcon,
    label: "Phẫn nộ",
  },
};
