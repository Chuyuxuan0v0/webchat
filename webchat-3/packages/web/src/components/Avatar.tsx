interface AvatarProps {
  username: string;
  avatar?: string;
  avatarBgColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export default function Avatar({
  username,
  avatar,
  avatarBgColor = '#4ECDC4',
  size = 'md',
  className = '',
}: AvatarProps) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  const initials = username.slice(-2);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ${className}`}
      style={{ backgroundColor: avatarBgColor }}
    >
      {initials}
    </div>
  );
}
