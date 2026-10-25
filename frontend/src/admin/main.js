import { createApp } from 'vue';
import AdminApp from './AdminApp.vue';

// Load Design System styles
import '../styles/tokens.css';
import '../styles/fonts.css';
import '../styles/components.css';
import '../../assets/css/admin.css';

const app = createApp(AdminApp);
app.mount('#admin-root');
