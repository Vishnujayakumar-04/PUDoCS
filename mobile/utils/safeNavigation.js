/**
 * Safe Navigation Utilities
 * Prevents crashes from navigation errors
 */

/**
 * Safely navigate to a screen with error handling
 * @param {Object} navigation - Navigation object from React Navigation
 * @param {string} routeName - Name of the route to navigate to
 * @param {Object} params - Optional parameters to pass to the route
 * @returns {boolean} - Returns true if navigation was successful, false otherwise
 */
export const safeNavigate = (navigation, routeName, params = {}) => {
    try {
        if (!navigation) {
            console.warn('Navigation object is undefined');
            return false;
        }

        if (!routeName || typeof routeName !== 'string') {
            console.warn('Invalid route name:', routeName);
            return false;
        }

        if (typeof navigation.navigate !== 'function') {
            console.warn('Navigation.navigate is not a function');
            return false;
        }

        navigation.navigate(routeName, params);
        return true;
    } catch (error) {
        console.error('Navigation error:', error);
        console.error('Route:', routeName, 'Params:', params);
        return false;
    }
};

/**
 * Check if a route exists in the navigation state
 * @param {Object} navigation - Navigation object
 * @param {string} routeName - Name of the route to check
 * @returns {boolean} - Returns true if route exists
 */
export const routeExists = (navigation, routeName) => {
    try {
        if (!navigation || !navigation.getState) {
            return false;
        }

        const state = navigation.getState();
        if (!state || !state.routes) {
            return false;
        }

        // Check in current navigator
        const currentRoutes = state.routes || [];
        const routeFound = currentRoutes.some(route => route.name === routeName);

        // Also check nested navigators
        const nestedRoutes = currentRoutes
            .map(route => route.state?.routes || [])
            .flat();
        const nestedFound = nestedRoutes.some(route => route.name === routeName);

        return routeFound || nestedFound;
    } catch (error) {
        console.error('Error checking route existence:', error);
        return false;
    }
};

export default {
    safeNavigate,
    routeExists,
};

