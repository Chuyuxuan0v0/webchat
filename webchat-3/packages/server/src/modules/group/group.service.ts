import { Group, IGroup } from '../../models';
import { AppError } from '../../middleware/error.middleware';

export const groupService = {
  async createGroup(userId: string, data: { name: string; description?: string }) {
    const group = await Group.create({
      name: data.name,
      description: data.description || '',
      owner: userId,
      members: [userId],
    });

    return group;
  },

  async getGroups(userId: string) {
    const groups = await Group.find({ members: userId })
      .populate('owner', 'username avatar avatarBgColor')
      .populate('members', 'username avatar avatarBgColor status');

    return groups;
  },

  async getGroup(groupId: string) {
    const group = await Group.findById(groupId)
      .populate('owner', 'username avatar avatarBgColor')
      .populate('members', 'username avatar avatarBgColor status');

    if (!group) {
      throw new AppError(404, 'Group not found');
    }

    return group;
  },

  async updateGroup(groupId: string, userId: string, data: { name?: string; description?: string; avatar?: string }) {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new AppError(404, 'Group not found');
    }

    if (group.owner.toString() !== userId) {
      throw new AppError(403, 'Only group owner can update group');
    }

    Object.assign(group, data);
    await group.save();

    return group;
  },

  async addMember(groupId: string, userId: string, memberId: string) {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new AppError(404, 'Group not found');
    }

    if (group.owner.toString() !== userId) {
      throw new AppError(403, 'Only group owner can add members');
    }

    if (group.members.includes(memberId as any)) {
      throw new AppError(400, 'User is already a member');
    }

    group.members.push(memberId as any);
    await group.save();

    return group;
  },

  async removeMember(groupId: string, userId: string, memberId: string) {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new AppError(404, 'Group not found');
    }

    if (group.owner.toString() !== userId) {
      throw new AppError(403, 'Only group owner can remove members');
    }

    if (memberId === group.owner.toString()) {
      throw new AppError(400, 'Cannot remove group owner');
    }

    group.members = group.members.filter((m) => m.toString() !== memberId);
    await group.save();

    return group;
  },
};
