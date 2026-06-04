/* ─── Helpers ────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-violet-400",
  "bg-pink-400",
  "bg-amber-400",
  "bg-cyan-400",
  "bg-rose-400",
];

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const avatarColorFor = (name = "") => {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

/* ─── Sub-components ─────────────────────────────────────────── */

/** Circular avatar — shows image if provided, otherwise coloured initials */
const UserAvatar = ({ name, avatarUrl, size = 40, className = "", style }) => (
  <div
    className={`rounded-full shrink-0 flex items-center justify-center
      text-white font-semibold overflow-hidden
      border border-[var(--color-border)] cursor-pointer
      ${!avatarUrl ? avatarColorFor(name) : ""}
      ${className}`}
    style={{ width: size, height: size, fontSize: size / 3, ...style }}
  >
    {avatarUrl ? (
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
    ) : (
      getInitials(name)
    )}
  </div>
);

export default UserAvatar;
