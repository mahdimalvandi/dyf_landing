<template>
  <div class="dyf-otp-grid">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      ref="inputRefs"
      type="text"
      maxlength="1"
      inputmode="numeric"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      class="dyf-otp-digit"
      :class="{
        'is-filled': !!digit,
        'dyf-input-error': hasError,
      }"
      :value="digit"
      @input="handleInput(index, $event)"
      @keydown="handleKeyDown(index, $event)"
      @paste="handlePaste($event)"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { toEnglishDigits } from '../shared/utils/format.js';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  length: {
    type: Number,
    default: 5,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const digits = ref(Array(props.length).fill(''));
const inputRefs = ref([]);

watch(
  () => props.modelValue,
  (val) => {
    const chars = (val || '').slice(0, props.length).split('');
    digits.value = Array.from({ length: props.length }, (_, i) => chars[i] || '');
  },
  { immediate: true }
);

function focusFirst() {
  nextTick(() => {
    if (inputRefs.value && inputRefs.value[0]) {
      inputRefs.value[0].focus();
    }
  });
}

function handleInput(index, event) {
  const raw = toEnglishDigits(event.target.value).replace(/\D/g, '');
  const char = raw ? raw.slice(-1) : '';
  digits.value[index] = char;
  emit('update:modelValue', digits.value.join(''));

  if (char && index < props.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus();
    });
  }
}

function handleKeyDown(index, event) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
  } else if (event.key === 'Enter') {
    emit('submit');
  }
}

function handlePaste(event) {
  event.preventDefault();
  const raw = (event.clipboardData || window.clipboardData).getData('text').trim();
  const pasteData = toEnglishDigits(raw).replace(/\D/g, '');
  if (pasteData.length >= props.length) {
    const sliced = pasteData.slice(0, props.length).split('');
    sliced.forEach((char, i) => {
      digits.value[i] = char;
    });
    emit('update:modelValue', digits.value.join(''));
    nextTick(() => {
      inputRefs.value[props.length - 1]?.focus();
    });
  }
}

defineExpose({
  focusFirst,
});
</script>
