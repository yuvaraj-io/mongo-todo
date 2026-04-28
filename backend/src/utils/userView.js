function mapRelation(item) {
  if (!item) {
    return null;
  }
  if (typeof item === "string") {
    return { id: item };
  }
  if (item._id) {
    return {
      id: item._id,
      username: item.username,
      profileImage: item.profileImage
    };
  }
  return { id: item };
}

export function toUserView(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    bio: user.bio,
    friends: (user.friends || []).map(mapRelation).filter(Boolean),
    sentRequests: (user.sentRequests || []).map(mapRelation).filter(Boolean),
    receivedRequests: (user.receivedRequests || []).map(mapRelation).filter(Boolean)
  };
}
