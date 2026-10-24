<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import AdminSidebar from '../components/AdminSidebar.vue';
import AdminTopbar from '../components/AdminTopbar.vue';
import { dashboardService } from '@/shared/api/services';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const isSidebarOpen = ref(false);

const counts = reactive({
  shoes: 0,
  categories: 0,
  customers: 0,
  links: 0,
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebar() {
  isSidebarOpen.value = false;
}

onMounted(async () => {
  // Ensure profile is loaded
  if (!authStore.adminUser.value) {
    await authStore.checkAuth();
  }

  // Load KPI overview counts for sidebar badges
  try {
    const res = await dashboardService.getOverview();
    if (res.success && res.data?.stats) {
      counts.shoes = res.data.stats.activeShoesCount;
      counts.customers = res.data.stats.totalCustomersCount;
      counts.links = res.data.stats.activeLinksCount;
    }
  } catch {
    // Graceful fallback to initial values
  }
});
</script>

<template>
  <div class="dyf-admin-app">
    <!-- سایدبار ناوبری و لایه پوششی موبایل -->
    <AdminSidebar
      :is-open="isSidebarOpen"
      :counts="counts"
      @close="closeSidebar"
    />

    <!-- محتوای اصلی و نوار بالا -->
    <div class="dyf-admin-main-wrap">
      <AdminTopbar @toggle-sidebar="toggleSidebar" />

      <main class="dyf-admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
