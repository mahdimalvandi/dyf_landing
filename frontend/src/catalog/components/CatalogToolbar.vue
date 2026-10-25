<template>
  <section class="dyf-cat-toolbar">
    <div class="dyf-cat-filter-wrapper">
      <!-- دراپ‌داون انتخابی دسته‌بندی برای موبایل -->
      <div
        id="catCategoryDropdown"
        ref="dropdownWrapRef"
        class="dyf-cat-category-dropdown"
        :class="{ 'is-open': isDropdownOpen }"
      >
        <button
          type="button"
          class="dyf-cat-dropdown-trigger"
          id="catDropdownTrigger"
          aria-haspopup="listbox"
          :aria-expanded="isDropdownOpen ? 'true' : 'false'"
          @click.stop="isDropdownOpen = !isDropdownOpen"
        >
          <div class="dyf-cat-dropdown-trigger-text">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="color: var(--gold-light); flex-shrink: 0;"
            >
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
            <span id="catDropdownSelectedLabel">{{ dropdownSelectedLabel }}</span>
          </div>
          <svg class="dyf-cat-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div class="dyf-cat-dropdown-menu" id="catDropdownMenu" role="listbox" tabindex="-1">
          <button
            type="button"
            class="dyf-cat-dropdown-item"
            :class="{ 'is-active': selectedCategory === 'all' }"
            @click="handleSelectCategory('all')"
          >
            <span class="dyf-cat-dropdown-item-title">همه مدل‌های مجاز</span>
            <span class="dyf-cat-dropdown-item-count">{{ totalEligibleCount }} مدل</span>
          </button>
          <button
            v-for="cat in uniqueCategories"
            :key="cat.title"
            type="button"
            class="dyf-cat-dropdown-item"
            :class="{ 'is-active': selectedCategory === cat.title }"
            @click="handleSelectCategory(cat.title)"
          >
            <span class="dyf-cat-dropdown-item-title">{{ cat.title }}</span>
            <span class="dyf-cat-dropdown-item-count">{{ cat.count }} مدل</span>
          </button>
        </div>
      </div>

      <!-- تب‌های افقی دسته‌بندی برای دسکتاپ -->
      <div class="dyf-cat-filter-tabs" id="catCategoryFilterTabs">
        <button
          type="button"
          class="dyf-cat-filter-btn"
          :class="{ 'is-active': selectedCategory === 'all' }"
          @click="handleSelectCategory('all')"
        >
          همه مدل‌های مجاز ({{ totalEligibleCount }})
        </button>
        <button
          v-for="cat in uniqueCategories"
          :key="cat.title"
          type="button"
          class="dyf-cat-filter-btn"
          :class="{ 'is-active': selectedCategory === cat.title }"
          @click="handleSelectCategory(cat.title)"
        >
          {{ cat.title }} ({{ cat.count }})
        </button>
      </div>
    </div>

    <!-- جست‌وجو -->
    <div class="dyf-cat-search-group">
      <div class="dyf-toolbar-search">
        <svg class="dyf-quick-search-icon" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          :value="searchQuery"
          type="text"
          id="catSearchInput"
          class="dyf-quick-search-input"
          placeholder="جست‌وجوی مدل، سبک زیره، چرم..."
          @input="$emit('update:searchQuery', $event.target.value)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  uniqueCategories: {
    type: Array,
    default: () => [],
  },
  totalEligibleCount: {
    type: Number,
    default: 0,
  },
  selectedCategory: {
    type: String,
    default: 'all',
  },
  searchQuery: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:selectedCategory', 'update:searchQuery']);

const isDropdownOpen = ref(false);
const dropdownWrapRef = ref(null);

const dropdownSelectedLabel = computed(() => {
  if (props.selectedCategory === 'all') {
    return `همه مدل‌های مجاز (${props.totalEligibleCount})`;
  }
  const found = props.uniqueCategories.find((c) => c.title === props.selectedCategory);
  if (found) {
    return `${found.title} (${found.count} مدل)`;
  }
  return props.selectedCategory;
});

function handleSelectCategory(cat) {
  emit('update:selectedCategory', cat);
  isDropdownOpen.value = false;
}

function handleDocumentClick(e) {
  if (dropdownWrapRef.value && !dropdownWrapRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>
