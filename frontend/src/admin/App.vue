<script setup lang="ts">
import ToastNotification from './components/ToastNotification.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
</script>

<template>
  <router-view />
  <ToastNotification />
  <ConfirmDialog />
</template>
