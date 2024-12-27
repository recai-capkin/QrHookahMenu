const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7010/api', //Api için kök Url
    imageBaseUrl: import.meta.env.VITE_IMAGE_BASE_URL || 'https://localhost:7010', // Resimler için kök URL
};

export default config;
