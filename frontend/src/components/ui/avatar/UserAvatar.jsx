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

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const avatarColorFor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

/* ─── Sub-components ─────────────────────────────────────────── */

/** Circular avatar — shows image if provided, otherwise coloured initials */
const UserAvatar = ({ name, avatarUrl, id }) => (
  <div
    className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center
      text-white text-[13px] font-semibold overflow-hidden
      ${!avatarUrl ? avatarColorFor(id) : ""}`}
  >
    {avatarUrl ? (
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
    ) : (
      getInitials(name)
    )}
  </div>
);

export default UserAvatar;
