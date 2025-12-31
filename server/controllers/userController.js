const userService = require('../services/userService');

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await userService.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar_url,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message,
    });
  }
};

/**
 * Get user preferences
 */
const getPreferences = async (req, res) => {
  try {
    const preferences = await userService.getUserPreferences(req.user.id);

    res.json({
      preferences: preferences || {},
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      error: 'Failed to get preferences',
      message: error.message,
    });
  }
};

/**
 * Update user preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Preferences object is required',
      });
    }

    // Validate allowed fields
    const allowedFields = [
      'preferred_target_language',
      'preferred_tone',
      'auto_save_history',
      'theme',
    ];

    const filteredPreferences = {};
    Object.keys(preferences).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredPreferences[key] = preferences[key];
      }
    });

    const updated = await userService.updateUserPreferences(
      req.user.id,
      filteredPreferences
    );

    res.json({
      success: true,
      preferences: updated,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error.message,
    });
  }
};

/**
 * Get translation history
 */
const getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await userService.getTranslationHistory(
      req.user.id,
      limit,
      offset
    );

    res.json({
      history: result.history,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Failed to get history',
      message: error.message,
    });
  }
};

/**
 * Save translation to history
 */
const saveTranslation = async (req, res) => {
  try {
    const { originalText, translatedText, sourceLanguage, targetLanguage, tone } = req.body;

    if (!originalText || !translatedText) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'originalText and translatedText are required',
      });
    }

    const translation = await userService.saveTranslation(req.user.id, {
      originalText,
      translatedText,
      sourceLanguage,
      targetLanguage,
      tone,
    });

    res.json({
      success: true,
      translation,
    });
  } catch (error) {
    console.error('Save translation error:', error);
    res.status(500).json({
      error: 'Failed to save translation',
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  getPreferences,
  updatePreferences,
  getHistory,
  saveTranslation,
};
