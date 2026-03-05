import ConfigCity from '../models/ConfigCity.js';
import ConfigProvince from '../models/ConfigProvince.js';
import ConfigService from '../models/ConfigService.js';
import ConfigDestination from '../models/ConfigDestination.js';
import ConfigPreference from '../models/ConfigPreference.js';
import ConfigBank from '../models/ConfigBank.js';

/**
 * Validation utility to check if values exist in config collections
 * Usage: await validateCity('Colombo')
 */

export const validateCity = async (cityName) => {
  const city = await ConfigCity.findOne({ name: cityName, isActive: true });
  return !!city;
};

export const validateProvince = async (provinceName) => {
  const province = await ConfigProvince.findOne({ name: provinceName, isActive: true });
  return !!province;
};

export const validateService = async (serviceName) => {
  const service = await ConfigService.findOne({ name: serviceName, isActive: true });
  return !!service;
};

export const validateDestination = async (destinationName) => {
  const dest = await ConfigDestination.findOne({ name: destinationName, isActive: true });
  return !!dest;
};

export const validatePreference = async (category, value) => {
  const pref = await ConfigPreference.findOne({ category, value, isActive: true });
  return !!pref;
};

export const validateBank = async (bankName) => {
  const bank = await ConfigBank.findOne({ name: bankName, isActive: true });
  return !!bank;
};

/**
 * Middleware to validate vendor registration input
 */
export const validateVendorInput = async (req, res, next) => {
  try {
    const { city, province, bankName } = req.body;

    // Validate city if provided
    if (city && !(await validateCity(city))) {
      return res.status(400).json({ message: `City '${city}' not found in configuration` });
    }

    // Validate province if provided
    if (province && !(await validateProvince(province))) {
      return res.status(400).json({ message: `Province '${province}' not found in configuration` });
    }

    // Validate bank if provided
    if (bankName && !(await validateBank(bankName))) {
      return res.status(400).json({ message: `Bank '${bankName}' not found in configuration` });
    }

    // Validate services array if provided
    if (req.body.services && Array.isArray(req.body.services)) {
      for (const service of req.body.services) {
        if (!(await validateService(service))) {
          return res.status(400).json({ message: `Service '${service}' not found in configuration` });
        }
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Validation error', error: error.message });
  }
};

/**
 * Middleware to validate trip input
 */
export const validateTripInput = async (req, res, next) => {
  try {
    const { destination, location } = req.body;

    // Validate destination if provided
    if (destination && !(await validateDestination(destination))) {
      return res.status(400).json({ message: `Destination '${destination}' not found in configuration` });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Validation error', error: error.message });
  }
};

/**
 * Middleware to validate user preferences
 */
export const validateUserPreferences = async (req, res, next) => {
  try {
    const { travelPreferences } = req.body;

    if (!travelPreferences) return next();

    const { mealPlan, travelStyle, accommodationType, activityInterests, dietaryRestrictions } = travelPreferences;

    // Validate meal plan
    if (mealPlan && !(await validatePreference('mealPlan', mealPlan))) {
      return res.status(400).json({ message: `Meal plan '${mealPlan}' is not valid` });
    }

    // Validate travel style
    if (travelStyle && !(await validatePreference('travelStyle', travelStyle))) {
      return res.status(400).json({ message: `Travel style '${travelStyle}' is not valid` });
    }

    // Validate accommodation types
    if (accommodationType && Array.isArray(accommodationType)) {
      for (const type of accommodationType) {
        if (!(await validatePreference('accommodationType', type))) {
          return res.status(400).json({ message: `Accommodation type '${type}' is not valid` });
        }
      }
    }

    // Validate activity interests
    if (activityInterests && Array.isArray(activityInterests)) {
      for (const activity of activityInterests) {
        if (!(await validatePreference('activityInterest', activity))) {
          return res.status(400).json({ message: `Activity interest '${activity}' is not valid` });
        }
      }
    }

    // Validate dietary restrictions
    if (dietaryRestrictions && Array.isArray(dietaryRestrictions)) {
      for (const restriction of dietaryRestrictions) {
        if (!(await validatePreference('dietaryRestriction', restriction))) {
          return res.status(400).json({ message: `Dietary restriction '${restriction}' is not valid` });
        }
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Validation error', error: error.message });
  }
};
