const Profile = require('../models/Profile');

const createProfile = async (profileData) => {
    const { user_id } = profileData;

    const existingProfile = await Profile.findOne({ where: { user_id } });
    if (existingProfile) {
        throw new Error('Profile already exists for this user');
    }

    return await Profile.create(profileData);
};

const getProfileByUserId = async (user_id) => {
    const profile = await Profile.findOne({ where: { user_id } });

    if (!profile) {
        throw new Error('Profile not found');
    }

    return profile;
};

const updateProfile = async (user_id, updateData) => {
    // Reutilizamos la función de arriba para buscar
    const profile = await getProfileByUserId(user_id);

    await profile.update(updateData);
    return profile;
};

const deleteProfile = async (user_id) => {
    const profile = await getProfileByUserId(user_id);

    await profile.destroy();
    return { message: 'Profile deleted successfully' };
};

module.exports = {
    createProfile,
    getProfileByUserId,
    updateProfile,
    deleteProfile
};