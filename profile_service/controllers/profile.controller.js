const profileService = require('../services/profile.service');

const createProfile = async (req, res) => {
    try {
        const profile = await profileService.createProfile(req.body);
        res.status(201).json(profile);
    } catch (error) {
        if (error.message === 'Profile already exists for this user') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        const profile = await profileService.getProfileByUserId(user_id);
        res.status(200).json(profile);
    } catch (error) {
        if (error.message === 'Profile not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        const updates = req.body;

        const updatedProfile = await profileService.updateProfile(user_id, updates);
        res.status(200).json(updatedProfile);
    } catch (error) {
        if (error.message === 'Profile not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const deleteProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await profileService.deleteProfile(user_id);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Profile not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const healthCheck = (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Profile service is available' });
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile,
    deleteProfile,
    healthCheck
};