import { createApp } from 'vue';
import AdminApp from './AdminApp.vue';
import { useToast } from '../composables/useToast.js';

// Load Design System styles
import '../styles/tokens.css';
import '../styles/fonts.css';
import '../styles/components.css';
import '../../assets/css/admin.css';

const app = createApp(AdminApp);
app.config.errorHandler = (error) => useToast().showToast({ type: 'error', title: 'عملیات انجام نشد', message: error.message });
app.mount('#admin-root');
