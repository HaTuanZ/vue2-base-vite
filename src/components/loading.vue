<template>
  <div class="lds-dual-ring color-primary">
    <span class="sr-only">Loading...</span>
  </div>
</template>
<script>
export default {
  name: "loading-component"
};
</script>
<style scoped>
.lds-dual-ring.color-primary:after {
  border: 3px solid var(--v-primary-base) !important;
  border-color: var(--v-primary-base) transparent var(--v-primary-base)
    transparent !important;
}
</style>
