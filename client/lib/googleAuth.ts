/**
 * Google OAuth Configuration
 * Client ID from Google Cloud Console
 */
export const GOOGLE_CLIENT_ID = '2429522708-a23fo3djrroar5totemudl58iftntvak.apps.googleusercontent.com';

/**
 * Initialize Google Sign-In
 * Call this function when the page loads
 */
export const initializeGoogleSignIn = () => {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.google) {
            resolve(window.google);
            return;
        }

        // Load Google Sign-In script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google) {
                resolve(window.google);
            } else {
                reject(new Error('Google Sign-In failed to load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
        document.head.appendChild(script);
    });
};

/**
 * Handle Google Sign-In
 * @param {Function} onSuccess - Callback function when sign-in is successful
 * @param {Function} onError - Callback function when sign-in fails
 */
export const handleGoogleSignIn = async (onSuccess, onError) => {
    try {
        await initializeGoogleSignIn();

        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    // Send ID token to backend
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            idToken: response.credential
                        })
                    });

                    const data = await res.json();

                    if (res.ok) {
                        // Store token
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));

                        if (onSuccess) {
                            onSuccess(data);
                        }
                    } else {
                        throw new Error(data.error || 'Google authentication failed');
                    }
                } catch (error) {
                    console.error('Google auth error:', error);
                    if (onError) {
                        onError(error);
                    }
                }
            }
        });

        // Prompt Google One Tap
        window.google.accounts.id.prompt();
    } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        if (onError) {
            onError(error);
        }
    }
};

/**
 * Render Google Sign-In button
 * @param {string} elementId - ID of the element to render the button in
 * @param {Function} onSuccess - Callback function when sign-in is successful
 * @param {Function} onError - Callback function when sign-in fails
 */
export const renderGoogleButton = async (elementId, onSuccess, onError) => {
    try {
        await initializeGoogleSignIn();

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    // Send ID token to backend
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            idToken: response.credential
                        })
                    });

                    const data = await res.json();

                    if (res.ok) {
                        // Store token
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));

                        if (onSuccess) {
                            onSuccess(data);
                        }
                    } else {
                        throw new Error(data.error || 'Google authentication failed');
                    }
                } catch (error) {
                    console.error('Google auth error:', error);
                    if (onError) {
                        onError(error);
                    }
                }
            }
        });

        // Render button
        window.google.accounts.id.renderButton(
            document.getElementById(elementId),
            {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'continue_with'
            }
        );
    } catch (error) {
        console.error('Failed to render Google button:', error);
        if (onError) {
            onError(error);
        }
    }
};
